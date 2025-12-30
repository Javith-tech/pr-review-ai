import { Router } from 'express';
import { passport, users } from '../config/passport';
import { generateToken, verifyToken } from '../utils/jwt';
import type { User } from '../types/user.types';
import { env } from '../config/env';

const router = Router();

router.get('/github', passport.authenticate('github', { session: false }));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    const user = req.user as User;

    if (!user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=no_user`);
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${env.FRONTEND_URL}?auth=success`);
  }
);

router.get('/me', (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    res.json({ user: null, authenticated: false });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.json({ user: null, authenticated: false });
    return;
  }

  const user = users.get(payload.userId);

  if (!user) {
    res.json({ user: null, authenticated: false });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessToken, ...userWithoutToken } = user;

  res.json({
    user: userWithoutToken,
    authenticated: true,
  });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;

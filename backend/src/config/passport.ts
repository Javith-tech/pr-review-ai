import passport from 'passport';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { env } from './env';
import type { User } from '../types/user.types';

const users = new Map<string, User>();

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.get(id);
  done(null, user || null);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['repo', 'read:user'],
    },
    (
      accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: (error: Error | null, user?: User | false) => void
    ) => {
      const user: User = {
        id: profile.id,
        username: profile.username || 'unknown',
        displayName: profile.displayName || profile.username || 'Unknown User',
        profileUrl: profile.profileUrl,
        avatarUrl: profile.photos?.[0]?.value || '',
        email: profile.emails?.[0]?.value,
        accessToken,
      };

      users.set(user.id, user);

      done(null, user);
    }
  )
);

export { passport, users };

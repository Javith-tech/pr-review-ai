import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { users } from '../config/passport';
import type { AuthenticatedRequest } from '../types/user.types';

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = users.get(payload.userId);
      if (user) {
        (req as AuthenticatedRequest).user = user;
      }
    }
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please sign in with GitHub to access this resource',
    });
    return;
  }

  next();
};

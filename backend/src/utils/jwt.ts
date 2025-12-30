import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { User } from '../types/user.types';

export interface JwtPayload {
  userId: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  email?: string;
  accessToken: string;
}

export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    profileUrl: user.profileUrl,
    avatarUrl: user.avatarUrl,
    email: user.email,
    accessToken: user.accessToken,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export interface User {
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  email?: string;
  accessToken: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
}

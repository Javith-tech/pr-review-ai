import { createContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/lib/auth";
import type { User, AuthState } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  continueAsGuest: () => void;
  isGuestMode: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authState = await authService.getCurrentUser();
      setUser(authState.user);
      setAuthenticated(authState.authenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = authService.getGitHubAuthUrl();
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const continueAsGuest = () => {
    setLoading(false);
    setAuthenticated(false);
    setUser(null);
    setIsGuestMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        loading,
        login,
        logout,
        continueAsGuest,
        isGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

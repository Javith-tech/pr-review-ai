import axios from "axios";
import type { AuthState } from "@/types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

export const authService = {
  async getCurrentUser(): Promise<AuthState> {
    try {
      const { data } = await authApi.get<AuthState>("/me");
      return data;
    } catch (error) {
      return { user: null, authenticated: false, loading: false };
    }
  },

  async logout(): Promise<void> {
    await authApi.post("/logout");
  },

  getGitHubAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/github`;
  },
};

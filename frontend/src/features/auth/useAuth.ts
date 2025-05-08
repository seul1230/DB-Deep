// src/features/auth/hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedOut: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setLoggedOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isLoggedOut: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isLoggedOut: false }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, isLoggedOut: true }),
      setLoggedOut: () => set({ isLoggedOut: true }),
    }),
    {
      name: "auth-storage",
    }
  )
);
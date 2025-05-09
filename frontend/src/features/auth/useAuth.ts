// src/features/auth/hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: {
    email: string;
    imageUrl: string | null;
    passwordNotChanged: boolean;
  } | null;
  isLoggedOut: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setProfile: (profile: AuthState["profile"]) => void;
  clearTokens: () => void;
  setLoggedOut: () => void;
}


export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      profile: null,
      isLoggedOut: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isLoggedOut: false }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, isLoggedOut: true }),
      setLoggedOut: () => set({ isLoggedOut: true }),
      setProfile: (profile) =>
        set({ profile })
    }),
    {
      name: "auth-storage",
    }
  )
);
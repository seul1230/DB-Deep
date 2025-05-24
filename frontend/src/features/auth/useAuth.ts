import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "./authTypes";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: UserProfile | null;
  isLoggedOut: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    profile: UserProfile
  ) => void;
  clearTokens: () => void;
  setLoggedOut: () => void;
  setProfile: (profile: UserProfile) => void; // ✅ 타입 정의 추가
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      profile: null,
      isLoggedOut: false,
      setTokens: (accessToken, refreshToken, profile) =>
        set({ accessToken, refreshToken, profile, isLoggedOut: false }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, profile: null, isLoggedOut: true }),
      setLoggedOut: () => set({ isLoggedOut: true }),
      setProfile: (profile) => set({ profile }), 
    }),
    {
      name: "auth-storage",
    }
  )
);

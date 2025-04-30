// src/features/auth/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login, LoginRequest, LoginResponse } from "@/shared/api/auth";
import { AxiosError } from "axios";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const setTokens = useAuth((state) => state.setTokens);

  return useMutation<LoginResponse, AxiosError, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken); // 저장
    },
  });
};

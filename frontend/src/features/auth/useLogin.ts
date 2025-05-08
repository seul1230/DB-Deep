import { useMutation } from "@tanstack/react-query";
import { LoginRequest, LoginResponse } from "./authTypes";
import { login } from "./authApi";
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

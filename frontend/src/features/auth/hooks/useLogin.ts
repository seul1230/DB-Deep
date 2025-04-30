import { useMutation } from "@tanstack/react-query";
import { login, LoginRequest, LoginResponse } from "@/shared/api/auth";
import { AxiosError } from "axios";

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginRequest>({
    mutationFn: login,
  });
};

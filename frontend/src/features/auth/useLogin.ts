import { useMutation } from "@tanstack/react-query";
import { LoginRequest, LoginResponse } from "./authTypes";
import { login } from "./authApi";
import { AxiosError } from "axios";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const setTokens = useAuth((state) => state.setTokens);
  const navigate = useNavigate();

  return useMutation<LoginResponse, AxiosError<{ message: string }>, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      const { accessToken, refreshToken, profile } = data;

      setTokens(accessToken, refreshToken, profile);

      if (profile.passwordNotChanged) {
        navigate("/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    onError: (error) => {
      alert(error.response?.data.message || "로그인에 실패했습니다.");
    },
  });
};

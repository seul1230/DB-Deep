import { LoginRequest, LoginApiResponse, LoginResponse } from "./authTypes";
import api from "@/shared/api/axios";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginApiResponse>("/auth/signin", data);
  return {
    accessToken: response.data.result.tokens.accessToken,
    refreshToken: response.data.result.tokens.refreshToken,
    profile: response.data.result.profile,
  };
};

export const sendEmailCode = async (email: string) => {
  const response = await api.post("/auth/email/code", { email });
  return response.data;
};

export const verifyEmailCode = async ({
  email,
  code,
}: {
  email: string;
  code: number;
}) => {
  const response = await api.post("/auth/email/code/verify", { email, code });
  return response.data;
};

// src/shared/api/auth.ts
import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginApiResponse>("/auth/signin", data);

  return response.data.result;
};

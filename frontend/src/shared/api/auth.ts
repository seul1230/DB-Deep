// src/shared/api/auth.ts
import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/signin", data);
  return response.data;
};

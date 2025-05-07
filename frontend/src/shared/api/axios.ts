import axios from "axios";
import { useAuth } from "@/features/auth/hooks/useAuth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;

  // Authorization 헤더 제외
  if (
    token &&
    config.url &&
    !config.url.includes("/auth/signin") &&
    !config.url.includes("/auth/email/code") &&
    !config.url.includes("/auth/email/code/verify")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      const auth = useAuth.getState();
      auth.clearTokens();
    }

    return Promise.reject(error);
  }
);

export default api;

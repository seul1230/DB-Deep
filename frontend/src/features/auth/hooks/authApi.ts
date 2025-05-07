import { useMutation } from "@tanstack/react-query";
import api from "@/shared/api/axios";

export const useSendEmail = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post("/auth/email/code", { email });
      return response.data;
    },
  });

export const useVerifyCode = () =>
  useMutation({
    mutationFn: async ({ email, code }: { email: string; code: number }) => {
      const response = await api.post("/auth/email/code/verify", { email, code });
      return response.data;
    },
  });

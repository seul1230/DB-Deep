import { useMutation } from "@tanstack/react-query";
import api from "@/shared/api/axios";

interface ChangePasswordRequest {
  password: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  password: string;
  message: string;
}

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: async ({ password, newPassword }) => {
      const { data } = await api.patch("/auth/password/change", {
        password,
        newPassword,
      });
      return data;
    },
  });
};

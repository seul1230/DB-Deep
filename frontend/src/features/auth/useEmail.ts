import { useMutation } from "@tanstack/react-query";
import { sendEmailCode, verifyEmailCode } from "./authApi";

export const useSendEmail = () =>
  useMutation({
    mutationFn: sendEmailCode,
  });

export const useVerifyCode = () =>
  useMutation({
    mutationFn: verifyEmailCode,
  });

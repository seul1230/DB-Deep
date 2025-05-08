import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import { AxiosError } from "axios";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/notifications");
        return data.notifications;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          return []; // 400이면 알림 없음 처리
        }
        throw error;
      }
    },
    staleTime: 1000 * 60, // 1분 캐싱
    retry: false,         // 400 반복 방지
    enabled: false,       // 수동 refetch만
  });
};

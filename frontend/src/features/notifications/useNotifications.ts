import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import { AxiosError } from "axios";
import { Notification } from "@/features/notifications/types";

export const useNotifications = () => {
  return useQuery<Notification[], AxiosError>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/notifications");
        return data.result.map((n: any) => ({
          notificationId: n.id,
          content: n.content,
          isRead: n.isRead,
          readAt: n.readAt,
          createdAt: n.createdAt,
        }));
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 1000 * 60, // 1분 캐싱
    retry: false,         // 400 반복 방지
    enabled: false,       // 수동 refetch만
  });
};

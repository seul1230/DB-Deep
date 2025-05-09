import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import { AxiosError } from "axios";
import { Notification } from "@/features/notification/notificationTypes";

export const useNotifications = () => {
  return useQuery<Notification[], AxiosError>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<{ result: Notification[] }>("/notifications");
      return data.result;
    },
    staleTime: 1000 * 60,
    retry: false,
    enabled: false,
  });
};

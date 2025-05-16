import { useQuery } from '@tanstack/react-query';
import { fetchChatRooms } from './chatApi';

export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => fetchChatRooms(),
    enabled: false,
  });
};

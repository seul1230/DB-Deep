// src/features/chat/hooks/useChatRooms.ts
import { useQuery } from '@tanstack/react-query';
import { fetchChatRooms } from './chatApi';

export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => fetchChatRooms(),
    staleTime: 1000 * 60 * 3,
  });
};

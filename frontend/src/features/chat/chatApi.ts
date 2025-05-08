// src/features/chat/hooks/chatApi.ts
import axios from '@/shared/api/axios';

export interface ChatRoom {
  id: string;
  title: string;
  lastMessageAt: string;
}

interface ChatRoomResponse {
  chatRooms: ChatRoom[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const fetchChatRooms = async (
  cursor?: string,
  size = 30
): Promise<ChatRoomResponse> => {
  const response = await axios.get('/chats', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    params: { size, cursor },
  });

  return response.data.result;
};

import axios from '@/shared/api/axios';
import { ChatApiResponse, ChatDetail } from './chatTypes';

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

export const shareChat = async (chatId: string, targetIds: string[]) => {
  const response = await axios.post("/chats/share", {
    chatId,
    targets: targetIds,
  });
  return response.data;
};

export const fetchChatDetail = async (
  chatId: string
): Promise<ChatDetail> => {
  const response = await axios.get<ChatApiResponse>(`/chats/${chatId}`);
  return response.data.result;
};

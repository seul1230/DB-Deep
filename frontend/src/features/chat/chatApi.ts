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

export const updateChatTitle = async (chatId: string, newTitle: string) => {
  const response = await axios.patch(`/chats/${chatId}/title`, {
    title: newTitle,
  });

  return response.data;
};

export const shareChat = async (chatId: string, targetIds: string[]) => {
  const response = await axios.post("/chats/share", {
    chatId,
    targets: targetIds,
  });
  return response.data;
};

export const deleteChatRoom = async (chatId: string) => {
  const response = await axios.delete(`/chats/${chatId}`);
  return response.data;
};
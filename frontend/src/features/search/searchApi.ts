import api from '@/shared/api/axios';
import { SearchChatResponse } from './searchTypes';

export const searchChats = async (keyword: string): Promise<SearchChatResponse> => {
  const response = await api.get('/chats/search', {
    params: { keyword },
  });

  return response.data;
};

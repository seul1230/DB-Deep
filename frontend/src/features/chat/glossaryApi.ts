import axios from 'axios';
import { useAuth } from '@/features/auth/useAuth';

const GLOSSARY_API_URL = 'https://dbdeep.kr/fast/api/glossary';

const glossaryInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 시 Authorization 헤더 삽입
glossaryInstance.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const glossaryApi = {
  getAll: async () => {
    const res = await glossaryInstance.get(GLOSSARY_API_URL);
    return res.data;
  },

  create: async (data: { key: string; value: string }) => {
    const res = await glossaryInstance.post(GLOSSARY_API_URL, data);
    return res.data;
  },

  update: async (id: string, data: { key?: string; value?: string }) => {
    const res = await glossaryInstance.put(`${GLOSSARY_API_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await glossaryInstance.delete(`${GLOSSARY_API_URL}/${id}`);
    return res.data;
  },
};
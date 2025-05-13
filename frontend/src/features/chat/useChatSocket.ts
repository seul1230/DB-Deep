import { useEffect } from 'react';
import { useChatMessageStore } from './useChatMessageStore';
import { getSocket } from '@/shared/api/socketManager';

export const useChatSocket = (chatId?: string) => {
  const { startNewMessage, appendToLast, finalizeLast } = useChatMessageStore();

  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.onopen = () => {
      console.log('✅ WebSocket 연결 성공');
      startNewMessage(chatId);
    };

    socket.onmessage = (event) => {
      const raw = event.data?.trim();
      if (!raw) return;

      try {
        if (raw.startsWith('{') && raw.endsWith('}')) {
          appendToLast(chatId, { type: 'chart', content: JSON.parse(raw) });
        } else if (raw.startsWith('SQL:')) {
          appendToLast(chatId, { type: 'sql', content: raw.replace(/^SQL:/, '').trim() });
        } else if (raw.startsWith('---')) {
          appendToLast(chatId, { type: 'status', content: raw.replace(/---/g, '').trim() });
        } else {
          appendToLast(chatId, { type: 'text', content: raw });
        }
      } catch (err) {
        console.error('❌ WebSocket parsing error:', err);
      }
    };

    socket.onerror = (e) => {
      console.error('❌ WebSocket 오류:', e);
    };

    socket.onclose = () => {
      console.warn('🔌 WebSocket 연결 종료');
      finalizeLast(chatId);
    };

    return () => {
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
    };
  }, [chatId, startNewMessage, appendToLast, finalizeLast]);
};

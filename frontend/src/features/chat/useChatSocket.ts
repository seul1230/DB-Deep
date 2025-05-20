import { useEffect } from 'react';
import {
  connectSocket,
  getSocket,
  tryReconnect,
  flushPendingMessages,
} from '@/shared/api/socketManager';
import { useChatMessageStore } from './useChatMessageStore';
import { useQueryClient } from '@tanstack/react-query';
import { updateChatTitle, ChatRoom } from '@/features/chat/chatApi';
import { useWebSocketLogger } from './useWebSocketLogger';

export const useChatSocket = (chatId?: string) => {
  const {
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightQueue,
    appendInsightLine,
    setRealChatId,
    setIsLive
  } = useChatMessageStore();

  const queryClient = useQueryClient();
  const { addLog } = useWebSocketLogger();

  useEffect(() => {
    if (!chatId) return;

    connectSocket().then(() => {
      const socket = getSocket();
      if (!socket) return;

      socket.onopen = () => {
        console.log('✅ WebSocket 연결 성공');
        startNewMessage(chatId);
        flushPendingMessages();
      };

      socket.onmessage = (event) => {
        const raw = event.data;
        if (!raw) return;

        addLog({ type: 'data', message: `수신: ${raw}` });

        if (typeof raw === 'string' && raw.includes('서버 처리 중 오류')) {
          appendToLast(chatId, { type: 'status', content: '' });
          appendToLast(chatId, { type: 'status', content: `❌ ${raw}` });
          finalizeLast(chatId);
          return;
        }

        let msg;
        try {
          msg = JSON.parse(raw);
        } catch {
          console.error('❌ JSON 파싱 실패:', raw);
          return;
        }

        const { type, payload } = msg;

        switch (type) {
          case 'title': {
            const cache = queryClient.getQueryData<{ chatRooms: ChatRoom[] }>(['chatRooms']);
            const chatRoom = cache?.chatRooms?.find((room) => room.id === chatId);
            if (chatRoom?.title === '새 채팅방') {
              updateChatTitle(chatId, payload).then(() => {
                queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
              }).catch(console.error);
            }
            return;
          }

          case 'info':
            if (typeof payload === 'string' && /^[a-zA-Z0-9_-]+$/.test(payload)) {
              setRealChatId(chatId, payload);
              finalizeLast(chatId);
              return;
            }

            if (payload === 'SQL 생성 중...') {
              appendToLast(chatId, { type: 'status', content: 'SQL 생성 중...' });
            } else if (payload === '차트 생성 중...') {
              appendToLast(chatId, { type: 'status', content: '차트 생성 중...' });
            } else if (payload === '인사이트 생성 중') {
              setInsightQueue(chatId, () => []);
              appendToLast(chatId, { type: 'status', content: '' });
            } else if (payload === '인사이트 생성 완료') {
              finalizeLast(chatId);
            }
            return;

          case 'console':
            addLog({ type: 'console', message: payload });
            return;

          case 'query':
            appendToLast(chatId, { type: 'sql', content: payload });
            return;

          case 'data':
            appendToLast(chatId, { type: 'data', content: payload });
            return;

          case 'chart':
            appendToLast(chatId, { type: 'chart', content: payload });
            return;

          case 'data_summary':
          case 'insight_stream':
            setInsightQueue(chatId, (prev = []) => [...prev, payload]);
            appendToLast(chatId, {
              type: 'text',
              content: '',
            });
            setIsLive(chatId, true);
            return;

          case 'follow_up_stream':
            setInsightQueue(chatId, (prev = []) => [...prev, payload]);
            appendToLast(chatId, {
              type: 'text',
              content: '',
            });
            setIsLive(chatId, false);
            return;

          default:
            console.warn('❓ 알 수 없는 type:', type);
        }
      };

      socket.onerror = (e) => console.error('❌ WebSocket 오류:', e);
      socket.onclose = () => {
        console.warn('🔌 WebSocket 연결 종료');
        finalizeLast(chatId);
        tryReconnect();
      };
    });
  }, [
    chatId,
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightQueue,
    appendInsightLine,
    setRealChatId,
    queryClient,
    addLog,
    setIsLive
  ]);
};

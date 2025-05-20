import { useEffect } from 'react';
import { useLocation, useMatch } from 'react-router-dom'; 
import {
  connectSocket,
  getSocket,
  tryReconnect,
} from '@/shared/api/socketManager';
import { useChatMessageStore } from './useChatMessageStore';
import { useQueryClient } from '@tanstack/react-query';
import { updateChatTitle, ChatRoom } from '@/features/chat/chatApi';
import { useWebSocketLogger } from './useWebSocketLogger';

export const useChatSocket = (chatId?: string) => {
  const location = useLocation(); // ✅ 현재 페이지 경로 확인

  const {
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightText,
    setRealChatId,
    setIsLive,
  } = useChatMessageStore();

  const queryClient = useQueryClient();
  const { addLog } = useWebSocketLogger();
  const match = useMatch("/chat/:chatId");
  
  useEffect(() => {
    // ✅ 1. chatId 없거나 현재 페이지가 /chat/{id}가 아니면 연결하지 않음
    if (!match || !chatId) return;

    connectSocket().then(() => {
      const socket = getSocket();
      if (!socket) return;

      socket.onopen = () => {
        console.log('✅ WebSocket 연결 성공');
        startNewMessage(chatId);
      };

      socket.onmessage = (event) => {
        const raw = event.data;
        if (!raw) return;

        addLog({ type: 'data', message: `수신: ${raw}` });

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
              updateChatTitle(chatId, payload)
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                })
                .catch(console.error);
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
              setInsightText(chatId, () => '');
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

          case 'insight_stream':
          case 'data_summary':
            setInsightText(chatId, (prev = '') => prev + payload);
            appendToLast(chatId, { type: 'text', content: payload });
            setIsLive(chatId, true);
            return;

          case 'follow_up_stream':
            setInsightText(chatId, (prev = '') => prev + payload);
            appendToLast(chatId, { type: 'text', content: payload });
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
    match,
    location.pathname,
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightText,
    setRealChatId,
    queryClient,
    addLog,
    setIsLive,
  ]);
};

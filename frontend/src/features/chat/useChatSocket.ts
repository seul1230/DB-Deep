import { useEffect } from 'react';
import {
  connectSocket,
  getSocket,
  tryReconnect,
  flushPendingMessages, // ✅ 반드시 import
} from '@/shared/api/socketManager';
import { useChatMessageStore } from './useChatMessageStore';
import { useQueryClient } from '@tanstack/react-query';
import { updateChatTitle } from '@/features/chat/chatApi';
import { ChatRoom } from '@/features/chat/chatApi';
import { useWebSocketLogger } from './useWebSocketLogger';

export const useChatSocket = (chatId?: string) => {
  const {
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightQueue,
    appendInsightLine,
    setRealChatId,
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
        flushPendingMessages(); // ✅ 누락된 메시지 자동 전송
      };

      socket.onmessage = (event) => {
        const raw = event.data;
        if (!raw) return;

        addLog({ type: 'data', message: `수신: ${raw}` });

        // ✅ 에러 문자열 직접 처리
        if (typeof raw === 'string' && raw.includes('서버 처리 중 오류')) {
          appendToLast(chatId, { type: 'status', content: '' }); // 기존 status 제거
          appendToLast(chatId, {
            type: 'status',
            content: `❌ ${raw}`,
          });
          finalizeLast(chatId); // 응답 종료
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
            const chatRoom = cache?.chatRooms?.find((room: ChatRoom) => room.id === chatId);
            const currentTitle = chatRoom?.title ?? '';

            if (currentTitle === '새 채팅방') {
              updateChatTitle(chatId, payload)
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                })
                .catch((err) => {
                  console.error('❌ 채팅방 제목 업데이트 실패:', err);
                });
            }
            return;
          }

          case 'info': {
            if (payload === 'SQL 생성 중...') {
              appendToLast(chatId, { type: 'status', content: 'SQL 생성 중...' });
            } else if (payload === '차트 생성 중...') {
              appendToLast(chatId, { type: 'status', content: '차트 생성 중...' });
            } else if (payload === '인사이트 생성 중') {
              setInsightQueue(chatId, () => []);
              appendToLast(chatId, { type: 'status', content: '' });
            } else if (payload === '인사이트 생성 완료') {
              finalizeLast(chatId);
            } else if (typeof payload === 'string' && /^[a-zA-Z0-9_-]+$/.test(payload)) {
              setRealChatId(chatId, payload);
            }
            return;
          }

          case 'query': {
            appendToLast(chatId, { type: 'sql', content: payload });
            return;
          }

          case 'data': {
            appendToLast(chatId, { type: 'data', content: payload });
            return;
          }

          case 'chart': {
            appendToLast(chatId, { type: 'chart', content: payload });
            return;
          }

          case 'insight_stream': {
            setInsightQueue(chatId, (prev = []) => [...prev, payload]);
            appendToLast(chatId, { type: 'text', content: payload });
            return;
          }

          default:
            console.warn('❓ 알 수 없는 type:', type);
        }
      };

      socket.onerror = (e) => {
        console.error('❌ WebSocket 오류:', e);
      };

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
  ]);
};

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/shared/api/socketManager';
import { useChatMessageStore } from './useChatMessageStore';
import { tryReconnect } from '@/shared/api/socketManager';
import { useQueryClient } from '@tanstack/react-query';
import { updateChatTitle } from '@/features/chat/chatApi';

export const useChatSocket = (chatId?: string) => {
  const updatedTitlesRef = useRef<Set<string>>(new Set());
  const {
    startNewMessage,
    appendToLast,
    finalizeLast,
    setInsightQueue,
    appendInsightLine,
    setRealChatId,
  } = useChatMessageStore();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    connectSocket().then(() => {
      const socket = getSocket();
      if (!socket) return;

      socket.onopen = () => {
        console.log('✅ WebSocket 연결 성공');
        startNewMessage(chatId);
      };

      socket.onmessage = async (event) => {
        const raw = event.data;
        if (!raw) return;

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
            // 현재 캐시에 저장된 채팅방 제목 확인
            const cache = queryClient.getQueryData<any>(['chatRooms']);

            const chatRoom = cache?.chatRooms?.find((room: any) => room.id === chatId);
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
              setInsightQueue(chatId, []);
              appendToLast(chatId, { type: 'status', content: '' });
            } else if (payload === '인사이트 생성 완료') {
              finalizeLast(chatId);
            } else {
              if (typeof payload === 'string' && /^[a-zA-Z0-9_-]+$/.test(payload)) {
                setRealChatId(chatId, payload);
              }
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
            const chars = payload.split('');
            for (const ch of chars) {
              appendInsightLine(chatId, ch);
            }
            // insight_stream을 text 파트로도 저장
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
  }, [chatId, startNewMessage, appendToLast, finalizeLast, setInsightQueue, appendInsightLine, setRealChatId, queryClient]);
};

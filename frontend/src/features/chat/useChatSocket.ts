// src/features/chat/useChatSocket.ts
import { useEffect } from 'react';
import { connectSocket, getSocket, tryReconnect } from '@/shared/api/socketManager';
import { useChatMessageStore } from './useChatMessageStore';
import { useQueryClient } from '@tanstack/react-query';
import { updateChatTitle } from '@/features/chat/chatApi';
import { useWebSocketLogger } from './useWebSocketLogger';
import { showErrorToast } from '@/shared/toast';
import type { ChartData } from '@/features/chat/chatTypes';

export const useChatSocket = (chatId?: string) => {
  const queryClient = useQueryClient();
  const { addLog } = useWebSocketLogger();
  const {
    appendToLast,
    finalizeLast,
    setInsightText,
    setRealChatId,
    setIsLive,
    setMessages,
  } = useChatMessageStore();

  useEffect(() => {
    console.log('[useChatSocket] mount', { chatId });
    if (!chatId) {
      console.log('[useChatSocket] no chatId, skip');
      return;
    }

    connectSocket()
      .then((sock) => {
        console.log('[useChatSocket] connected', sock);

        const socket = getSocket();
        if (!socket) {
          console.error('[useChatSocket] getSocket() returned null');
          return;
        }

        socket.onopen = () => {
          console.log('[useChatSocket] onopen');
        };

        socket.onmessage = (event) => {
          console.log('[useChatSocket] onmessage raw:', event.data);
          const raw = event.data;

          // 1) 순수 텍스트 에러: JSON 아니면 곧바로 에러 처리
          if (typeof raw === 'string' && !raw.trim().startsWith('{')) {
            setMessages(
              chatId,
              useChatMessageStore
                .getState()
                .messages[chatId]
                .slice(0, -1)
            );
            return;
          }

          // 2) JSON 파싱
          let msg: unknown;
          try {
            msg = JSON.parse(raw);
          } catch {
            console.error('[useChatSocket] JSON 파싱 실패:', raw);
            return;
          }

          // 타입 가드
          if (typeof msg !== 'object' || msg === null || !('type' in msg)) {
            console.warn('[useChatSocket] unexpected msg shape', msg);
            return;
          }
          const { type, payload } = msg as { type: string; payload: unknown };

          switch (type) {
            case 'ping':
              return;

            case 'error':
              // JSON 형태로 내려오는 에러
              if (typeof payload === 'string') {
                showErrorToast(payload);
              }
              finalizeLast(chatId);
              return;

            case 'console':
              // 오직 WebSocket 콘솔에만 표시
              addLog({ type: 'console', message: String(payload) });
              return;

            case 'title':
              if (typeof payload === 'string') {
                updateChatTitle(chatId, payload)
                  .then(() => queryClient.invalidateQueries({ queryKey: ['chatRooms'] }))
                  .catch(console.error);
              }
              return;

            case 'info':
              if (payload === 'SQL & 데이터 생성 중'
               || payload === 'SQL 생성 중...'
               || payload === '차트 생성 중...') {
                appendToLast(chatId, { type: 'status', content: payload as string });
              } else if (payload === '인사이트 생성 중') {
                setInsightText(chatId, () => '');
                appendToLast(chatId, { type: 'status', content: '' });
              } else if (payload === '인사이트 생성 완료') {
                finalizeLast(chatId);
              } else if (typeof payload === 'string' && /^[A-Za-z0-9_-]+$/.test(payload)) {
                setRealChatId(chatId, payload);
                finalizeLast(chatId);
              }
              return;

            case 'query':
              if (typeof payload === 'string') {
                appendToLast(chatId, { type: 'sql', content: payload });
              }
              return;

            case 'data':
              if (Array.isArray(payload)) {
                appendToLast(chatId, { type: 'data', content: payload as Record<string, string|number>[] });
              }
              return;

            case 'chart':
              if (
                typeof payload === 'object' &&
                payload !== null &&
                Array.isArray((payload as ChartData).x) &&
                Array.isArray((payload as ChartData).y)
              ) {
                appendToLast(chatId, { type: 'chart', content: payload as ChartData });
              }
              return;

            case 'insight_stream':
            case 'data_summary':
              if (typeof payload === 'string') {
                setInsightText(chatId, (prev='') => prev + payload);
                appendToLast(chatId, { type: 'text', content: payload });
                setIsLive(chatId, true);
              }
              return;

            case 'follow_up_stream':
              if (typeof payload === 'string') {
                setInsightText(chatId, (prev='') => prev + payload);
                appendToLast(chatId, { type: 'text', content: payload });
                setIsLive(chatId, false);
              }
              return;

            case 'insight':
              if (typeof payload === 'string') {
                appendToLast(chatId, { type: 'text', content: payload });
                finalizeLast(chatId);
              }
              return;

            default:
              console.warn('[useChatSocket] unknown type:', type);
          }
        };

        socket.onerror = (err) => {
          console.error('[useChatSocket] error', err);
          finalizeLast(chatId);
        };
        socket.onclose = () => {
          console.warn('[useChatSocket] closed');
          finalizeLast(chatId);
          tryReconnect();
        };
      })
      .catch((err) => {
        console.error('[useChatSocket] connectSocket failed', err);
      });
  }, [
    chatId,
    queryClient,
    addLog,
    appendToLast,
    finalizeLast,
    setInsightText,
    setRealChatId,
    setIsLive,
    setMessages,
  ]);
};

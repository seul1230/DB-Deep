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
  const { ignoreIncoming, setIgnoreIncoming } = useChatMessageStore();
  const { addLog } = useWebSocketLogger();
  const { ignoreConsoleLogs } = useWebSocketLogger();
  const {
    appendToLast,
    finalizeLast,
    setInsightText,
    setRealChatId,
    setIsLive,
    setMessages,
  } = useChatMessageStore();

  useEffect(() => {
    if (!chatId) return;

    connectSocket()
      .then(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.onmessage = (event) => {
          const raw = event.data;

          if (ignoreIncoming) {
            try {
              const m = JSON.parse(raw);
              if (m.type === 'info' && m.payload === '🛑 생성 중단 요청 완료') {
                setIgnoreIncoming(false);
              }
            } catch {
              /* 무시 */
            }
            return;
          }

          // 1) 순수 텍스트 에러 처리
          if (typeof raw === 'string' && !raw.trim().startsWith('{')) {
            const prev = useChatMessageStore
              .getState()
              .messages[chatId]
              .slice(0, -1);
            setMessages(chatId, prev);
            return;
          }

          // 2) JSON 파싱
          let msg: unknown;
          try {
            msg = JSON.parse(raw);
          } catch {
            return;
          }

          // 타입 가드
          if (typeof msg !== 'object' || msg === null || !('type' in msg)) return;
          const { type, payload } = msg as { type: string; payload: unknown };

          switch (type) {
            case 'ping':
              return;

            case 'error':
              if (typeof payload === 'string' && !payload.includes('알 수 없는 type: ping')) {
                showErrorToast(payload);
              }
              finalizeLast(chatId);
              return;

            case 'console':
              if (!ignoreConsoleLogs) {
                addLog({ type: 'console', message: String(payload) });
              }
              return;

            case 'title':
              if (typeof payload === 'string') {
                updateChatTitle(chatId, payload)
                  .then(() =>
                    queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
                  )
                  .catch(() => {
                    /* 무시 */
                  });
              }
              return;

            case 'info':
              if (
                payload === 'SQL & 데이터 생성 중' ||
                payload === 'SQL 생성 중...' ||
                payload === '차트 생성 중...'
              ) {
                appendToLast(chatId, { type: 'status', content: payload as string });
              } else if (payload === '인사이트 생성 중') {
                setInsightText(chatId, () => '');
                appendToLast(chatId, { type: 'status', content: '' });
              } else if (payload === '인사이트 생성 완료') {
                finalizeLast(chatId);
              } else if (
                typeof payload === 'string' &&
                /^[A-Za-z0-9_-]+$/.test(payload)
              ) {
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
                appendToLast(chatId, {
                  type: 'data',
                  content: payload as Record<string, string | number>[],
                });
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
                // ① 메시지 리스트에서 방금 추가된 live 메시지의 id 가져오기
                const msgs = useChatMessageStore.getState().messages[chatId] || [];
                const lastMsg = msgs[msgs.length - 1];
                const mid = lastMsg.id;

                // ② 해당 메시지 ID 로만 insight 누적
                setInsightText(mid, prev => (prev ?? '') + payload);
                appendToLast(chatId, { type: 'text', content: payload });
                setIsLive(chatId, true);
              }
              return;

            case 'follow_up_stream':
              if (typeof payload === 'string') {
                const msgs = useChatMessageStore.getState().messages[chatId] || [];
                const lastMsg = msgs[msgs.length - 1];
                const mid = lastMsg.id;

                setInsightText(mid, prev => (prev ?? '') + payload);
                appendToLast(chatId, { type: 'text', content: payload });
                setIsLive(chatId, false);
              }
              return;

            case 'insight':
              if (typeof payload === 'string') {
                // 타입라이팅 끝나면 insightText 초기화
                const msgs = useChatMessageStore.getState().messages[chatId] || [];
                const lastMsg = msgs[msgs.length - 1];
                const mid = lastMsg.id;

                finalizeLast(chatId);
                setInsightText(mid, () => '');  
              }
              return;

            default:
              return;
          }
        };

        socket.onerror = () => {
          finalizeLast(chatId);
        };
        socket.onclose = () => {
          finalizeLast(chatId);
          tryReconnect();
        };
      })
      .catch(() => {
        /* 무시 */
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
    ignoreConsoleLogs,
    ignoreIncoming,
    setIgnoreIncoming,
  ]);
};

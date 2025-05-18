import { ChatPayload } from '@/features/chat/chatTypes';
import { showErrorToast } from '@/shared/toast';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger'; // ✅ 추가

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const WS_URL = 'wss://da.dbdeep.kr/ws/chat';

const pendingMessages: ChatPayload[] = [];

export const getSocket = () => socket;

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      const ping = { type: 'ping' };
      socket.send(JSON.stringify(ping));
      // ❌ ping은 로그에 남기지 않음
    }
  }, 10000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;
};

export const tryReconnect = () => {
  if (reconnectTimeout || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    showErrorToast('서버와 연결할 수 없습니다. 새로고침해주세요.');
    return;
  }

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    reconnectAttempts++;
    console.warn(`[Socket] 🔁 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    connectSocket()
      .then(() => console.log('[Socket] 🔁 재연결 성공'))
      .catch((err) => {
        console.error('[Socket] 재연결 실패', err);
        tryReconnect();
      });
  }, 2000 * reconnectAttempts);
};

export const connectSocket = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const stored = localStorage.getItem('auth-storage');
    const token = stored ? JSON.parse(stored)?.state?.accessToken : null;

    if (!token) {
      showErrorToast('인증 정보가 없습니다. 다시 로그인해주세요.');
      return reject('No token');
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return resolve(socket);
    }

    try {
      socket = new WebSocket(`${WS_URL}?token=${token}`);
    } catch (err) {
      showErrorToast('웹소켓 생성에 실패했습니다.');
      return reject(err);
    }

    socket.onopen = () => {
      console.log('[Socket] ✅ 연결 성공');
      reconnectAttempts = 0;
      startHeartbeat();
      flushPendingMessages();
      resolve(socket!);
    };

    socket.onerror = (err) => {
      console.error('[Socket] ❌ 에러 발생', err);
      stopHeartbeat();
      reject(err);
    };

    socket.onclose = () => {
      console.warn('[Socket] 🔌 연결 종료');
      stopHeartbeat();
    };
  });
};

const flushPendingMessages = () => {
  console.log(`[Socket] 📤 대기 중 메시지 ${pendingMessages.length}개 전송`);
  while (pendingMessages.length > 0) {
    const msg = pendingMessages.shift();
    if (msg) sendMessage(msg); // ✅ sendMessage로 보내면서 로깅도 적용됨
  }
};

export const sendMessage = (data: ChatPayload) => {
  const json = JSON.stringify(data);

  // ✅ 로그 추가: 내가 보낸 메시지
  useWebSocketLogger.getState().addLog({
    type: 'sent',
    message: `전송: ${json}`,
  });

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(json);
  } else {
    console.warn('[Socket] 연결 안 됨. 메시지를 큐에 저장합니다.');
    pendingMessages.push(data);
  }
};

export const closeSocket = () => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
  stopHeartbeat();
  socket?.close();
  socket = null;
};

import { showErrorToast } from '@/shared/toast';

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const WS_URL = 'wss://da.dbdeep.kr/ws/chat';

let hasConnectedWithId = false;

export const getSocket = () => socket;

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
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
    console.log('[Socket] Connecting to:', `${WS_URL}?token=${token}`);
    console.log('[DEBUG] connectSocket 호출 스택:', new Error().stack); 
    
    if (!token) {
      showErrorToast('인증 정보가 없습니다. 다시 로그인해주세요.');
      return reject('No token');
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('[Socket] 이미 연결된 소켓 있음');
      return resolve(socket);
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      if (socket.readyState === WebSocket.OPEN) {
        resolve(socket);
      } else {
        socket.onopen = () => {
          reconnectAttempts = 0;
          startHeartbeat();
          resolve(socket!);
        };
      }
      return resolve(socket);
    }

    try {
      socket = new WebSocket(`${WS_URL}?token=${token}`);
    } catch (err) {
      showErrorToast('웹소켓 생성에 실패했습니다.');
      return reject(err);
    }

    socket.onopen = () => {
      reconnectAttempts = 0;
      startHeartbeat();
      resolve(socket!);
    };

    socket.onerror = (err) => {
      stopHeartbeat();
      reject(err);
    };

    socket.onclose = () => {
      stopHeartbeat();
    };
  });
};

export const sendInitialConnection = (uuid: string, department: string) => {
  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('🔌 소켓 연결 안됨');
    return;
  }
  socket.send(JSON.stringify({ uuid, user_department: department }));
  hasConnectedWithId = true;
};

export const sendMessage = (msg: { question: string }) => {
  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN || !hasConnectedWithId) {
    console.warn('🔌 소켓 연결 안됨 또는 초기 연결 미완료');
    return;
  }
  socket.send(JSON.stringify({ question: msg.question }));
};

export const sendMessageSafely = async ({
  chatId,
  department,
  question,
}: {
  chatId: string;
  department: string;
  question: string;
}) => {
  const socket = getSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    await connectSocket();
    resetInitialConnectionState();
    sendInitialConnection(chatId, department);
    setTimeout(() => {
      sendMessage({ question });
    }, 200);
  } else {
    if (!hasConnectedWithId) {
      sendInitialConnection(chatId, department);
      setTimeout(() => {
        sendMessage({ question });
      }, 200);
    } else {
      sendMessage({ question });
    }
  }
};

export const resetInitialConnectionState = () => {
  hasConnectedWithId = false;
};

export const closeSocket = () => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
  stopHeartbeat();
  resetInitialConnectionState();
  socket?.close();
  socket = null;
};

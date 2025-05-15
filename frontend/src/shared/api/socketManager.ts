import { ChatPayload } from "@/features/chat/chatTypes";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const WS_URL = "wss://da.dbdeep.kr/ws/chat";

export const getSocket = () => socket;

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, 10000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;
};

const tryReconnect = () => {
  if (reconnectTimeout || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    reconnectAttempts++;
    console.warn(`[Socket] 🔁 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    connectSocket().catch((err) => {
      console.error("[Socket] 재연결 실패", err);
      tryReconnect(); // 실패한 경우 계속 재시도
    });
  }, 2000 * reconnectAttempts); // 지수 백오프
};

export const connectSocket = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const stored = localStorage.getItem("auth-storage");
    const token = stored ? JSON.parse(stored)?.state?.accessToken : null;

    if (!token) {
      console.warn("[Socket] ❌ 토큰 없음, 연결하지 않음");
      return reject("No token");
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return resolve(socket);
    }

    try {
      socket = new WebSocket(`${WS_URL}?token=${token}`);
    } catch (err) {
      return reject(err);
    }

    socket.onopen = () => {
      console.log("[Socket] ✅ 연결 성공");
      reconnectAttempts = 0; // 초기화
      startHeartbeat();
      resolve(socket as WebSocket);
    };

    socket.onerror = (err) => {
      console.error("[Socket] ❌ 에러 발생", err);
      stopHeartbeat();
      tryReconnect(); // ❗에러 시에도 재연결
      reject(err);
    };

    socket.onclose = () => {
      console.warn("[Socket] 🔌 연결 종료");
      stopHeartbeat();
      tryReconnect(); // ❗종료 시에도 재연결
    };
  });
};

export const sendMessage = (data: ChatPayload) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("[Socket] 연결되지 않음 (메시지 미전송)");
  }
};

export const closeSocket = () => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
  stopHeartbeat();
  socket?.close();
  socket = null;
};

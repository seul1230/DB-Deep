import { ChatPayload } from "@/features/chat/chatTypes";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const WS_URL = "wss://da.dbdeep.kr/ws/chat";

const startHeartbeat = () => {
  stopHeartbeat(); // 혹시 남아 있던 하트비트 제거
  heartbeatInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, 10000); // 10초 간격
};

const stopHeartbeat = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;
};

const tryReconnect = () => {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    console.warn("[Socket] 🔁 재연결 시도 중...");
    connectSocket().catch((err) => console.error("[Socket] 재연결 실패", err));
  }, 3000);
};

export const connectSocket = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return resolve(socket);
    }

    const stored = localStorage.getItem("auth-storage");
    const token = stored ? JSON.parse(stored)?.state?.accessToken : null;

    if (!token) {
      console.warn("[Socket] ❌ 토큰 없음 → 연결 안함");
      return reject("No token");
    }

    try {
      socket = new WebSocket(`${WS_URL}?token=${token}`);
    } catch (err) {
      return reject(err);
    }

    socket.onopen = () => {
      console.log("[Socket] ✅ 연결됨");
      startHeartbeat();
      resolve(socket as WebSocket);
    };

    socket.onerror = (err) => {
      console.error("[Socket] ❌ 에러", err);
      stopHeartbeat();
      reject(err);
    };

    socket.onclose = () => {
      console.warn("[Socket] 🔌 연결 종료");
      stopHeartbeat();
      tryReconnect();
    };
  });
};

export const getSocket = () => socket;

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
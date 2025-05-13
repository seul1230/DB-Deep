import { ChatMessage } from "@/features/chat/chatTypes";

// src/shared/api/socketManager.ts
let socket: WebSocket | null = null;

export const connectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  socket = new WebSocket("wss://dbdeep.kr/ws/chat");

  socket.onopen = () => console.log("[Socket] 연결됨");
  socket.onclose = () => console.log("[Socket] 연결 종료");
  socket.onerror = (err) => console.error("[Socket] 에러", err);

  return socket;
};

export const sendMessage = (payload: { uuid: string; question: string; department: string }) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.warn("[Socket] 연결되지 않음");
  }
};

export const listenMessage = (handler: (data: ChatMessage) => void) => {
  if (!socket) return;

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handler(data);
  };
};

export const closeSocket = () => {
  socket?.close();
};

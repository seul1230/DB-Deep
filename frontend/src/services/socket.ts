import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

let socket: Socket;

export const connectSocket = () => {
  socket = io(SOCKET_URL, { transports: ['websocket'] });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const subscribeToMessages = (cb: (msg: any) => void) => {
  if (!socket) return;
  socket.on('chat message', cb);
};

export const sendMessage = (message: string) => {
  if (socket) socket.emit('chat message', message);
};

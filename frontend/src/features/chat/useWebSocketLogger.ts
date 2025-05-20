// src/features/chat/useWebSocketLogger.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LogType = 'info' | 'error' | 'data' | 'status' | 'sent' | 'console';

interface LogEntry {
  type: LogType;
  message: string;
}

interface WebSocketLoggerState {
  logs: LogEntry[];
  isConnected: boolean;
  addLog: (log: LogEntry) => void;
  setConnected: (connected: boolean) => void;
}

export const useWebSocketLogger = create<WebSocketLoggerState>()(
  persist(
    (set) => ({
      logs: [],
      isConnected: false,
      addLog: (log) =>
        set((state) => {
          const next = [...state.logs, log];
          return { logs: next.slice(-100) };
        }),
      setConnected: (connected) => set({ isConnected: connected }),
    }),
    {
      name: 'websocket-logger', // localStorage 키 이름
    }
  )
);

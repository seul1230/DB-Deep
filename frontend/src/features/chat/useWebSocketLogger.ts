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
  removeLog: (index: number) => void;
}

export const useWebSocketLogger = create<WebSocketLoggerState>()(
  persist(
    (set) => ({
      logs: [],
      isConnected: false,
      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, log].slice(-100),
        })),
      setConnected: (connected) => set({ isConnected: connected }),
      removeLog: (index) =>
        set((state) => ({
          logs: state.logs.filter((_, i) => i !== index), // ✅ 불변성 유지
        })),
    }),
    {
      name: 'websocket-logger',
    }
  )
);

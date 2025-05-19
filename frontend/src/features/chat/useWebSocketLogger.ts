// src/features/chat/useWebSocketLogger.ts
import { create } from 'zustand';

type LogType = 'info' | 'error' | 'data' | 'status' | 'sent';

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

export const useWebSocketLogger = create<WebSocketLoggerState>((set) => ({
  logs: [],
  isConnected: false,
  addLog: (log) =>
    set((state) => {
      const next = [...state.logs, log];
      return { logs: next.slice(-100) };
    }),
  setConnected: (connected) => set({ isConnected: connected }),
}));

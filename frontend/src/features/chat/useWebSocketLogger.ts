import { create } from 'zustand';

type LogType = 'info' | 'error' | 'data' | 'status';

interface LogEntry {
  type: LogType;
  message: string;
}

interface WebSocketLoggerState {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
}

export const useWebSocketLogger = create<WebSocketLoggerState>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => {
      const next = [...state.logs, log];
      return {
        logs: next.slice(-100), // 최대 100줄 유지
      };
    }),
}));

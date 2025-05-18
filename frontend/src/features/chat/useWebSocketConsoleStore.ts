// src/features/chat/useWebSocketConsoleStore.ts
import { create } from 'zustand';

interface WebSocketConsoleState {
  isOpen: boolean;
  toggleConsole: () => void;
  setConsoleOpen: (open: boolean) => void;
}

export const useWebSocketConsoleStore = create<WebSocketConsoleState>((set) => ({
  isOpen: true,
  toggleConsole: () => set((state) => ({ isOpen: !state.isOpen })),
  setConsoleOpen: (open) => set({ isOpen: open }),
}));

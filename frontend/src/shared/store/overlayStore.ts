// useOverlayStore.ts
import { create } from "zustand";

interface OverlayState {
  isMenuOpen: boolean;
  menuPosition: { top: number; left: number } | null;
  selectedChatId: string | null;
  openMenu: (chatId: string, position: { top: number; left: number }) => void;
  closeMenu: () => void;
  toggleMenuForChatId: (chatId: string, position: { top: number; left: number }) => void;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  isMenuOpen: false,
  menuPosition: null,
  selectedChatId: null,

  openMenu: (chatId, position) =>
    set({ isMenuOpen: true, selectedChatId: chatId, menuPosition: position }),

  closeMenu: () =>
    set({ isMenuOpen: false, selectedChatId: null, menuPosition: null }),

  toggleMenuForChatId: (chatId, position) => {
    const { isMenuOpen, selectedChatId } = get();
    if (isMenuOpen && selectedChatId === chatId) {
      set({ isMenuOpen: false, selectedChatId: null, menuPosition: null });
    } else {
      set({ isMenuOpen: true, selectedChatId: chatId, menuPosition: position });
    }
  },
}));

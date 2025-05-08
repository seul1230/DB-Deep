// shared/store/useSearchOverlayStore.ts
import { create } from "zustand";

interface SearchOverlayState {
  isOpen: boolean;
  position: { top: number; left: number };
  targetId: string | null;
  overlayRef: HTMLDivElement | null;
  setOverlayRef: (ref: HTMLDivElement | null) => void;
  openOverlay: (position: { top: number; left: number }, targetId: string) => void;
  closeOverlay: () => void;
  toggleOverlayForTarget: (position: { top: number; left: number }, targetId: string) => void;
}

export const useSearchOverlayStore = create<SearchOverlayState>((set, get) => ({
  isOpen: false,
  position: { top: 0, left: 0 },
  targetId: null,
  overlayRef: null,

  setOverlayRef: (ref) => set({ overlayRef: ref }),

  openOverlay: (position, targetId) =>
    set({ isOpen: true, position, targetId }),

  closeOverlay: () =>
    set({ isOpen: false, targetId: null }),

  toggleOverlayForTarget: (position, targetId) => {
    const state = get();

    const sameTarget = state.targetId === targetId;
    const samePosition =
      state.position.top === position.top &&
      state.position.left === position.left;

    if (state.isOpen && sameTarget && samePosition) {
      set({ isOpen: false, targetId: null });
      return;
    }

    set({ isOpen: true, position, targetId });
  },
}));

import { create } from "zustand";

interface OverlayPosition {
  top: number;
  left: number;
}

interface CardOverlayState {
  isOpen: boolean;
  position: OverlayPosition;
  targetId: string | null;
  overlayRef: HTMLDivElement | null;

  toggleOverlayForTarget: (position: OverlayPosition, targetId: string) => void;
  closeOverlay: () => void;
  setOverlayRef: (ref: HTMLDivElement | null) => void;
}

export const useCardOverlayStore = create<CardOverlayState>((set, get) => ({
  isOpen: false,
  position: { top: 0, left: 0 },
  targetId: null,
  overlayRef: null,

  toggleOverlayForTarget: (position, targetId) => {
    const { isOpen, targetId: currentId, position: currentPos } = get();
    const sameTarget = currentId === targetId;
    const samePosition =
      currentPos.top === position.top && currentPos.left === position.left;

    if (isOpen && sameTarget && samePosition) {
      set({ isOpen: false, targetId: null });
    } else {
      set({ isOpen: true, position, targetId });
    }
  },

  closeOverlay: () => set({ isOpen: false, targetId: null }),
  setOverlayRef: (ref) => set({ overlayRef: ref }),
}));

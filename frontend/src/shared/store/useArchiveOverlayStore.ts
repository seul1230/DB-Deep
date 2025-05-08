import { create } from "zustand";

interface ArchiveOverlayState {
  isOpen: boolean;
  position: { top: number; left: number };
  targetId: string | null;
//   openOverlay: (position: { top: number; left: number }, targetId: string) => void;
  closeOverlay: () => void;
  overlayRef: HTMLDivElement | null;
  setOverlayRef: (ref: HTMLDivElement | null) => void;
  toggleOverlayForTarget: (position: { top: number; left: number }, targetId: string) => void;
}

export const useArchiveOverlayStore = create<ArchiveOverlayState>((set, get) => ({
    isOpen: false,
    position: { top: 0, left: 0 },
    targetId: null,
    overlayRef: null,
  
    setOverlayRef: (ref) => set({ overlayRef: ref }),
  
    closeOverlay: () => set({ isOpen: false, targetId: null }),
  
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
  
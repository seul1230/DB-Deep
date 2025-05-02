import { create } from 'zustand';

interface PanelState {
  isNotificationOpen: boolean;
  hasNotification: boolean;
  openNotification: () => void;
  closeNotification: () => void;
  setHasNotification: (has: boolean) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  isNotificationOpen: false,
  hasNotification: false,
  openNotification: () => set({ isNotificationOpen: true }),
  closeNotification: () => set({ isNotificationOpen: false }),
  setHasNotification: (has) => set({ hasNotification: has }),
}));

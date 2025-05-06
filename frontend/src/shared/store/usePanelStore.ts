import { create } from "zustand";

type PanelType = "notification" | "chatLog" |  "project" | null;

interface PanelState {
  openPanel: PanelType; // 하나의 상태로 통합
  hasNotification: boolean;

  openNotification: () => void;
  openChatLog: () => void;
  openProject: () => void;
  closePanel: () => void;

  toggleNotification: () => void;
  toggleChatLog: () => void;
  toggleProject: () => void;

  setHasNotification: (has: boolean) => void;
}

export const usePanelStore = create<PanelState>((set, get) => ({
  openPanel: null,
  hasNotification: false,

  openNotification: () => set({ openPanel: "notification" }),
  openChatLog: () => set({ openPanel: "chatLog" }),
  openProject: () => set({ openPanel: "project" }),
  closePanel: () => set({ openPanel: null }),

  toggleNotification: () => {
    const { openPanel } = get();
    set({ openPanel: openPanel === "notification" ? null : "notification" });
  },

  toggleChatLog: () => {
    const { openPanel } = get();
    set({ openPanel: openPanel === "chatLog" ? null : "chatLog" });
  },

  toggleProject: () => {
    const { openPanel } = get();
    set({ openPanel: openPanel === "project" ? null : "project" });
  },

  setHasNotification: (has) => set({ hasNotification: has }),
}));

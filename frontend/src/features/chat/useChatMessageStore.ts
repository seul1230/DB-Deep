import { create } from 'zustand';
import { ChatStreamMessage, ChatPart } from './chatTypes';

interface State {
  messages: Record<string, ChatStreamMessage[]>;
  setMessages: (chatId: string, msgs: ChatStreamMessage[]) => void;
  startNewMessage: (chatId: string) => void;
  startUserMessage: (chatId: string, content: string) => void;
  startLiveMessage: (chatId: string) => void;
  appendToLast: (chatId: string, part: ChatPart) => void;
  finalizeLast: (chatId: string) => void;
  insightText: Record<string, string>;
  setInsightText: (chatId: string, updater: (prev?: string) => string) => void;
  chatIdMap: Record<string, string>;
  setRealChatId: (uuid: string, realId: string) => void;
  getRealChatId: (uuid: string) => string | undefined;
  setIsLive: (chatId: string, isLive: boolean) => void;
}

export const useChatMessageStore = create<State>((set, get) => ({
  messages: {},
  setMessages: (chatId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [chatId]: msgs } })),

  startNewMessage: (chatId) => {
    const current = get().messages[chatId] || [];
    const newMsg: ChatStreamMessage = {
      id: `${Date.now()}`,
      uuid: chatId,
      parts: [],
      senderType: 'ai',
      isLive: true,
    };
    set({ messages: { ...get().messages, [chatId]: [...current, newMsg] } });
  },

  startUserMessage: (chatId, content) => {
    const current = get().messages[chatId] || [];
    const newMsg: ChatStreamMessage = {
      id: `${Date.now()}-user`,
      uuid: chatId,
      parts: [{ type: 'text', content }],
      senderType: 'user',
      isLive: false,
    };
    set({ messages: { ...get().messages, [chatId]: [...current, newMsg] } });
  },

  startLiveMessage: (chatId) => {
    const current = get().messages[chatId] || [];
    const newMsg: ChatStreamMessage = {
      id: `${Date.now()}-live`,
      uuid: chatId,
      parts: [{ type: 'status', content: '응답 생성 중...' }],
      senderType: 'ai',
      isLive: true,
    };
    set({ messages: { ...get().messages, [chatId]: [...current, newMsg] } });
  },

  appendToLast: (chatId, part) => {
    const msgs = get().messages[chatId] || [];
    if (!msgs.length) return;

    const last = msgs[msgs.length - 1];
    if (!last.isLive) return;

    let updatedParts = [...last.parts];

    if (['sql', 'data', 'chart'].includes(part.type)) {
      updatedParts = updatedParts.filter((p) => p.type !== 'status');
      updatedParts = updatedParts.filter((p) => p.type !== part.type);
      updatedParts.push(part);
    } else if (part.type === 'status') {
      updatedParts = updatedParts.filter((p) => p.type !== 'status');
      updatedParts.push(part);
    } else if (part.type === 'text') {
      updatedParts.push(part);
    }

    const updatedLast = { ...last, parts: updatedParts };
    set({ messages: { ...get().messages, [chatId]: [...msgs.slice(0, -1), updatedLast] } });
  },

  finalizeLast: (chatId) => {
    const msgs = get().messages[chatId] || [];
    if (!msgs.length) return;
    const last = { ...msgs[msgs.length - 1], isLive: false };
    set({
      messages: { ...get().messages, [chatId]: [...msgs.slice(0, -1), last] },
      insightText: { ...get().insightText, [chatId]: '' },
    });
  },

  insightText: {},
  setInsightText: (chatId, updater) =>
    set((state) => ({
      insightText: {
        ...state.insightText,
        [chatId]: updater(state.insightText[chatId]),
      },
    })),

  chatIdMap: {},
  setRealChatId: (uuid, realId) =>
    set((s) => ({ chatIdMap: { ...s.chatIdMap, [uuid]: realId } })),

  getRealChatId: (uuid) => get().chatIdMap[uuid],

  setIsLive: (chatId, isLive) => {
    const msgs = get().messages[chatId] || [];
    if (!msgs.length) return;
    const updated = { ...msgs[msgs.length - 1], isLive };
    set({
      messages: { ...get().messages, [chatId]: [...msgs.slice(0, -1), updated] },
    });
  },
}));

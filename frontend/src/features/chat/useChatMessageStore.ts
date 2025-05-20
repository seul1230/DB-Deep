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
  insightQueue: Record<string, string[]>;
  setInsightQueue: (chatId: string, updater: (prev?: string[]) => string[]) => void;
  appendInsightLine: (chatId: string, line: string) => void;
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

    // ✅ status 제거 조건 추가
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
      insightQueue: { ...get().insightQueue, [chatId]: [] }, // ✅ 여기서 비워줌
    });
  },

  insightQueue: {},
  setInsightQueue: (chatId, updater) =>
    set((state) => ({
      insightQueue: {
        ...state.insightQueue,
        [chatId]: updater(state.insightQueue[chatId]),
      },
    })),

  appendInsightLine: (chatId, line) => {
    const prev = get().insightQueue[chatId] || [];
    set({ insightQueue: { ...get().insightQueue, [chatId]: [...prev, line] } });
  },

  chatIdMap: {},
  setRealChatId: (uuid, realId) =>
    set((s) => ({ chatIdMap: { ...s.chatIdMap, [uuid]: realId } })),

  getRealChatId: (uuid) => get().chatIdMap[uuid],
  setIsLive: (chatId, isLive) => {
    const msgs = get().messages[chatId] || [];
    if (!msgs.length) return;

    const updated = { ...msgs[msgs.length - 1], isLive };
    set({
      messages: {
        ...get().messages,
        [chatId]: [...msgs.slice(0, -1), updated],
      },
    });
  },
}));

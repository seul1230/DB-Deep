import { create } from 'zustand';
import { ChatStreamMessage, ChatPart } from './chatTypes';
import { v4 as uuidv4 } from 'uuid';

interface State {
  messages: Record<string, ChatStreamMessage[]>;
  setMessages: (chatId: string, msgs: ChatStreamMessage[]) => void;
  startNewMessage: (chatId: string) => void;
  startUserMessage: (chatId: string, content: string) => void;
  startLiveMessage: (chatId: string) => void;
  appendToLast: (chatId: string, part: ChatPart) => void;
  finalizeLast: (chatId: string) => void;
  insightText: Record<string, string>;
  setInsightText: (messageId: string, updater: (prev?: string) => string) => void;
  chatIdMap: Record<string, string>;
  setRealChatId: (uuid: string, realId: string) => void;
  getRealChatId: (uuid: string) => string | undefined;
  setIsLive: (chatId: string, isLive: boolean) => void;
  ignoreIncoming: boolean;
  setIgnoreIncoming: (flag: boolean) => void;
  canType: Record<string, boolean>;
  setCanType: (messageId: string, value: boolean) => void;
}

export const useChatMessageStore = create<State>((set, get) => ({
  messages: {},
  setMessages: (chatId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [chatId]: msgs } })),

  startNewMessage: (chatId) => {
    const current = get().messages[chatId] || [];
    const newMsg: ChatStreamMessage = {
      id: uuidv4(),
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
      id: uuidv4(),
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
      id: uuidv4(),
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

    // ✅ 예외 처리: 종료된 메시지라도 query/data/chart는 허용
    const allowStatic = ['sql', 'data', 'chart'].includes(part.type);
    if (!last.isLive && !allowStatic) return;

    let updatedParts = [...last.parts];

    if (['sql', 'data', 'chart'].includes(part.type)) {
      updatedParts = updatedParts.filter((p) => p.type !== part.type);
      updatedParts.push(part);
    } else if (part.type === 'status') {
      updatedParts = updatedParts.filter((p) => p.type !== 'status');
      updatedParts.push(part);
    } else if (part.type === 'text') {
      updatedParts = updatedParts.filter((p) => p.type !== 'status');
      const prev = updatedParts[updatedParts.length - 1];
      if (prev && prev.type === 'text') {
        prev.content = prev.content + part.content;
      } else {
        updatedParts.push(part);
      }
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
      // insightText: { ...get().insightText, [chatId]: '' },
    });
  },

  insightText: {},
  setInsightText: (messageId, updater) =>
    set(state => ({
      insightText: {
        ...state.insightText,
        [messageId]: updater(state.insightText[messageId]),
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

  ignoreIncoming: false,
  setIgnoreIncoming: (flag) =>
    set({ ignoreIncoming: flag }),

  canType: {},
  setCanType: (messageId, value) =>
    set(state => ({
      canType: {
        ...state.canType,
        [messageId]: value,
      },
    })),
}));

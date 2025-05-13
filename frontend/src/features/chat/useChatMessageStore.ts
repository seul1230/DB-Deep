import { create } from 'zustand';
import { ChatStreamMessage, ChatPart } from './chatTypes';

type State = {
  messages: Record<string, ChatStreamMessage[]>;
  setMessages: (chatId: string, msgs: ChatStreamMessage[]) => void;
  startNewMessage: (chatId: string) => void;
  appendToLast: (chatId: string, part: ChatPart) => void;
  finalizeLast: (chatId: string) => void;
};

export const useChatMessageStore = create<State>((set) => ({
  messages: {},
  setMessages: (chatId, msgs) =>
    set((s) => ({
      messages: { ...s.messages, [chatId]: msgs },
    })),
  startNewMessage: (chatId) =>
    set((s) => {
      const current = s.messages[chatId] || [];
      const newMsg: ChatStreamMessage = {
        id: `${Date.now()}`,
        uuid: chatId,
        parts: [],
        senderType: 'AI',
        isLive: true,
      };
      return {
        messages: {
          ...s.messages,
          [chatId]: [...current, newMsg],
        },
      };
    }),
  appendToLast: (chatId, part) =>
    set((s) => {
      const msgs = s.messages[chatId] || [];
      if (!msgs.length) return s;
      const last = msgs[msgs.length - 1];
      if (!last.isLive) return s;

      const updatedLast = {
        ...last,
        parts: [...last.parts, part],
      };
      return {
        messages: {
          ...s.messages,
          [chatId]: [...msgs.slice(0, -1), updatedLast],
        },
      };
    }),
  finalizeLast: (chatId) =>
    set((s) => {
      const msgs = s.messages[chatId] || [];
      if (!msgs.length) return s;
      const last = { ...msgs[msgs.length - 1], isLive: false };
      return {
        messages: {
          ...s.messages,
          [chatId]: [...msgs.slice(0, -1), last],
        },
      };
    }),
}));

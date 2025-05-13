// src/features/chat/useChatMessageStore.ts
import { create } from "zustand";
import { ChatMessage } from "./chatTypes";

type State = {
  messages: Record<string, ChatMessage[]>;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
};

export const useChatMessageStore = create<State>((set) => ({
  messages: {},
  setMessages: (chatId, newMessages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: newMessages },
    })),
  addMessage: (chatId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), msg],
      },
    })),
}));

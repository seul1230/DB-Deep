// src/features/chat/useChatSocket.ts
import { useEffect } from "react";
import { listenMessage } from "@/shared/api/socketManager";
import { ChatMessage } from "./chatTypes";
import { useChatMessageStore } from "./useChatMessageStore";

export const useChatSocket = (chatId?: string) => {
  const addMessage = useChatMessageStore((s) => s.addMessage);

  useEffect(() => {
    if (!chatId) return;

    listenMessage((data: ChatMessage) => {
      if (data?.id && data.uuid === chatId) {
        addMessage(chatId, data);
      }
    });
  }, [chatId, addMessage]);
};

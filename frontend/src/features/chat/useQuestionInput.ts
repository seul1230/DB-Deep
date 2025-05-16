// ✅ useQuestionInput.ts
import { useState } from "react";
import { useChatMessageStore } from "./useChatMessageStore";

export const useQuestionInput = (onSubmit: (text: string, chatId: string) => void) => {
  const [value, setValue] = useState("");
  const { startUserMessage, startLiveMessage } = useChatMessageStore();

  const handleChange = (v: string) => setValue(v);

  const handleSubmit = (chatId: string) => {
    const trimmed = value.trim();
    if (!trimmed || !chatId) return;

    startUserMessage(chatId, trimmed);      // 사용자 메시지 추가
    startLiveMessage(chatId);              // 곧바로 응답 버블(스피너) 추가
    onSubmit(trimmed, chatId);             // WebSocket 메시지 전송
    setValue("");
  };

  return {
    value,
    onChange: handleChange,
    onSubmit: handleSubmit,
  };
};

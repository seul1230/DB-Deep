// src/features/chat/useQuestionInput.ts
import { useState } from "react";

export const useQuestionInput = (onSubmit: (text: string) => void) => {
  const [value, setValue] = useState("");

  const handleChange = (v: string) => setValue(v);
  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return { value, onChange: handleChange, onSubmit: handleSubmit };
};

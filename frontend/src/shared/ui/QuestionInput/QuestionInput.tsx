import React, { useRef } from "react";
import styles from "./QuestionInput.module.css";

interface Props {
  onChange?: (text: string) => void;
}

const QuestionInput: React.FC<Props> = ({ onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lineHeight = 24;
    const minHeight = 48;
    const maxHeight = 120;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    const expectedLines = Math.floor(nextHeight / lineHeight);

    textarea.style.height = expectedLines <= 1 ? `${minHeight}px` : `${nextHeight}px`;

    onChange?.(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      className={styles["QuestionInput-input"]}
      placeholder="무엇이든 물어보세요!"
      rows={1}
      onChange={handleInputResize}
    />
  );
};

export default QuestionInput;

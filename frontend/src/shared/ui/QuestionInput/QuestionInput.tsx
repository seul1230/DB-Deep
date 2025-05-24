// src/shared/ui/Chat/QuestionInput/QuestionInput.tsx
import React, { useRef } from "react";
import styles from "./QuestionInput.module.css";
import { FiSend, FiSquare } from "react-icons/fi";

interface Props {
  value?: string;
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  isLoading?: boolean;          // ★ 추가
  onStop?: () => void;          // ★ 추가
}

const QuestionInput: React.FC<Props> = ({
  value = "",
  onChange,
  onSubmit,
  isLoading = false,           // ★
  onStop,                      // ★
}) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        className={styles["QuestionInput-input"]}
        placeholder="무엇이든 물어보세요!"
        value={value}
        rows={1}
        onChange={handleInputResize}
        onKeyDown={handleKeyDown}
        disabled={isLoading}              // ★ 로딩 중 입력 금지
      />
      {isLoading ? (
        <button
          className={styles.sendButton}
          onClick={onStop}
          aria-label="정지"
        >
          <FiSquare />
        </button>
      ) : (
        <button
          className={styles.sendButton}
          onClick={() => onSubmit?.(value)}
          aria-label="보내기"
        >
          <FiSend />
        </button>
      )}
    </div>
  );
};

export default QuestionInput;

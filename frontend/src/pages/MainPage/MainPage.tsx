import React, { useRef } from "react";
import styles from "./MainPage.module.css";
import { FiPlus } from "react-icons/fi";

const recommendedQuestions = [
  "마케팅 캠페인 전후의 전환율 차이를 알려줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘.",
  "이번 달 신규 유입 트렌드를 요약해줘",
  "사용자 이탈률이 높은 구간을 찾아줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘. 그리고 너무 길면 어떻게 되는지?ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
];

const MainPage: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const lineHeight = 24;
      const minHeight = 48;
      const maxHeight = 120;

      textarea.style.height = "auto";

      const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
      const expectedLines = Math.floor(nextHeight / lineHeight);
  
      if (expectedLines <= 1) {
        textarea.style.height = `${minHeight}px`;
      } else {
        textarea.style.height = `${nextHeight}px`;
      }
    }
  };  

  return (
    <div className={styles["MainPage-container"]}>
      <h1 className={styles["MainPage-title"]}>무엇을 도와드릴까요?</h1>

      <textarea
        ref={textareaRef}
        className={styles["MainPage-input"]}
        placeholder="무엇이든 물어보세요!"
        rows={1}
        onInput={handleInputResize}
      />

      <ul className={styles["MainPage-list"]}>
        {recommendedQuestions.map((question, idx) => (
          <li key={idx} className={styles["MainPage-listItem"]}>
            <span>{question}</span>
            <FiPlus size={16} color="#3b3b90" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainPage;

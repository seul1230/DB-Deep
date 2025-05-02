import React from "react";
import styles from "./RecommendedList.module.css";
import { FiPlus } from "react-icons/fi";

interface Props {
  questions: string[];
  onSelect?: (question: string) => void;
}

const RecommendedList: React.FC<Props> = ({ questions, onSelect }) => {
  return (
    <ul className={styles["RecommendedList-list"]}>
      {questions.map((question, idx) => (
        <li
          key={idx}
          className={styles["RecommendedList-listItem"]}
          onClick={() => onSelect?.(question)}
        >
          <span>{question}</span>
          <FiPlus size={16} color="var(--icon-blue)" />
        </li>
      ))}
    </ul>
  );
};

export default RecommendedList;

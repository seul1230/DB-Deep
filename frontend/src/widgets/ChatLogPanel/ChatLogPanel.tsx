import React from "react";
import styles from "./ChatLogPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";

const chatLogs = [
  { id: 1, title: "3월 매출 요약", date: "2025년 4월 23일", active: true },
  { id: 2, title: "고객 이탈 분석", date: "2025년 4월 22일" },
  { id: 3, title: "월간 성과 요약", date: "2025년 4월 20일" },
  { id: 4, title: "리포트 자동화 테스트", date: "2025년 4월 17일" },
  { id: 5, title: "설문 응답 요약", date: "2025년 4월 11일" },
  { id: 6, title: "신규 기능 반응 분석", date: "2025년 4월 09일" },
  { id: 7, title: "상품 관심도 분석", date: "2025년 4월 09일" },
  { id: 8, title: "SQL 최적화 로그", date: "2025년 4월 02일" },
  { id: 9, title: "주간 리포트 초안", date: "2025년 3월 25일" },
  { id: 10, title: "타겟 유지 비교 분석", date: "2025년 3월 23일" },
];

const ChatLogPanel: React.FC = () => {
  const { closePanel } = usePanelStore();

  return (
    <div className={styles.ChatLogPanel}>
      <div className={styles["ChatLogPanel-header"]}>
        <span>채팅 로그</span>
        <button onClick={closePanel} className={styles["ChatLogPanel-close"]}>×</button>
      </div>
      <div className={styles["ChatLogPanel-list"]}>
        {chatLogs.map((log) => (
          <div
            key={log.id}
            className={`${styles["ChatLogPanel-item"]} ${log.active ? styles["active"] : ""}`}
          >
            <div className={styles["ChatLogPanel-content"]}>
              <span className={styles["ChatLogPanel-title"]}>{log.title}</span>
              <span className={styles["ChatLogPanel-date"]}>{log.date}</span>
            </div>
            <span className={styles["ChatLogPanel-menu"]}>⋯</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatLogPanel;

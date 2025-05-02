import React from "react";
import styles from "./NotificationPanel.module.css";
import { FiBell } from "react-icons/fi";

const notifications = [
  { id: 1, user: "이승우", message: "‘분기별 성과 보고서’", time: "10분 전", read: false },
  { id: 2, user: "박경완", message: "3월 성과 요약", time: "3시간 전", read: false },
  { id: 3, user: "조예슬", message: "‘캠페인 효과 분석’", time: "5시간 전", read: false },
  { id: 4, user: "이승우", message: "‘이상치 탐지 로그’", time: "12시간 전", read: true },
  { id: 5, user: "김지호", message: "‘전환율 트렌드 추적’", time: "23시간 전", read: true },
  { id: 6, user: "이승우", message: "‘유입 경로별 성과 비교’", time: "3일 전", read: true },
];

interface Props {
  onClose: () => void;
}

const NotificationPanel: React.FC<Props> = ({ onClose }) => {
  return (
    <div className={styles["NotificationPanel"]}>
      <div className={styles["NotificationPanel-header"]}>
        <span>알림 <span className={styles["NotificationPanel-badge"]}>3</span></span>
        <button onClick={onClose} className={styles["NotificationPanel-close"]}>×</button>
      </div>
      <div className={styles["NotificationPanel-list"]}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`${styles["NotificationPanel-item"]} ${
              n.read ? styles["read"] : ""
            }`}
          >
            <FiBell size={14} />
            <div>
              <strong>공유 알림</strong>
              <p>{n.user}님이 {n.message}를 공유했습니다.</p>
            </div>
            <span className={styles["NotificationPanel-time"]}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;

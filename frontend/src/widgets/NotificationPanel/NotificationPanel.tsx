import React, { useEffect } from "react";
import styles from "./NotificationPanel.module.css";
import { FiBell } from "react-icons/fi";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useNotifications } from "@/features/notifications/useNotifications";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { Notification } from "@/features/notifications/types";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Props {
  isOpen: boolean;
}

const NotificationPanel: React.FC<Props> = ({ isOpen }) => {
  const { closePanel } = usePanelStore();
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotifications();

  // isOpen 될 때 refetch 한 번만
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (isLoading) {
    return (
      <div className={`${styles["NotificationPanel"]} ${isOpen ? styles["open"] : ""}`}>
        <div className={styles["NotificationPanel-header"]}>
          <span>알림</span>
          <button onClick={closePanel} className={styles["NotificationPanel-close"]}>×</button>
        </div>
        <div className={styles["NotificationPanel-list"]}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles["NotificationPanel"]} ${isOpen ? styles["open"] : ""}`}>
        <div className={styles["NotificationPanel-header"]}>
          <span>알림</span>
          <button onClick={closePanel} className={styles["NotificationPanel-close"]}>×</button>
        </div>
        <div className={styles["NotificationPanel-list"]}>알림을 불러오지 못했습니다.</div>
      </div>
    );
  }

  return (
    <div className={`${styles["NotificationPanel"]} ${isOpen ? styles["open"] : ""}`}>
      <div className={styles["NotificationPanel-header"]}>
        <span>알림</span>
        <button onClick={closePanel} className={styles["NotificationPanel-close"]}>×</button>
      </div>
      <div className={styles["NotificationPanel-list"]}>
        {notifications.length === 0 ? (
          <p style={{ fontStyle: "italic", textAlign: "center", fontSize: "12px" }}>
            알림이 없습니다.
          </p>
        ) : (
          notifications.map((n: Notification) => (
            <div
              key={n.notificationId}
              className={`${styles["NotificationPanel-item"]} ${
                n.isRead ? styles["read"] : styles["unread"]
              }`}
            >
              <FiBell size={16} className={styles["NotificationPanel-icon"]} />
              <div className={styles["NotificationPanel-content"]}>
                <div className={styles["NotificationPanel-headerRow"]}>
                  <strong>공유 알림</strong>
                  <span className={styles["NotificationPanel-time"]}>
                    {dayjs(n.createdAt).fromNow()}
                  </span>
                </div>
                <p>{n.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

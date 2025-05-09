import React, { useEffect } from "react";
import styles from "./NotificationPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useNotifications } from "@/features/notification/useNotifications";
import NotificationList from "@/entities/notification/NotificationList/NotificationList";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { AxiosError } from "axios";

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

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const isEmpty =
    !isLoading &&
    ((Array.isArray(notifications) && notifications.length === 0) ||
      (error && (error as AxiosError).response?.status === 400));

  const isServerError =
    error && (error as AxiosError).response?.status !== 400;

  return (
    <div className={`${styles["NotificationPanel"]} ${isOpen ? styles["open"] : ""}`}>
      <div className={styles["NotificationPanel-header"]}>
        <span>알림</span>
        <button onClick={closePanel} className={styles["NotificationPanel-close"]}>
          ×
        </button>
      </div>
      <div className={styles["NotificationPanel-list"]}>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : isServerError ? (
          <p style={{ fontStyle: "italic", textAlign: "center", fontSize: "12px", color: "var(--gray-text)" }}>
            알림을 불러오지 못했습니다.
          </p>
        ) : isEmpty ? (
          <p style={{ fontStyle: "italic", textAlign: "center", fontSize: "12px", color: "var(--gray-text)" }}>
            알림이 없습니다.
          </p>
        ) : (
          <NotificationList notifications={notifications} />
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
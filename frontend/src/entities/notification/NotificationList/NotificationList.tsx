import React, { useState } from "react";
import { FiBell } from "react-icons/fi";
import dayjs from "dayjs";
import { Notification } from "@/features/notification/notificationTypes";
import styles from "./NotificationList.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import NotificationModal from "../NotificationModal/NotificationModal";

interface Props {
  notifications: Notification[];
}

const NotificationList: React.FC<Props> = ({ notifications }) => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const [selectedInfo, setSelectedInfo] = useState<{
    notificationId: number;
    chatId: string;
    chatName: string;
    memberName: string;
  } | null>(null);

  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId: number) =>
      api.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },    
  });

  const handleClick = (n: Notification) => {
  if (!n.isRead) {
    markAsRead(n.id);
  }
  setSelectedInfo({
    notificationId: n.id,
    chatId: n.chatId,
    chatName: n.chatName,
    memberName: n.memberName,
  });
  setShowModal(true);
};

  return (
    <div className={styles["NotificationList-wrapper"]}>
      {notifications.length === 0 ? (
        <p style={{ fontStyle: "italic", textAlign: "center", fontSize: "12px" }}>
          알림이 없습니다.
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`${styles["NotificationList-item"]} ${
              n.isRead ? styles["read"] : styles["unread"]
            }`}
            onClick={() => handleClick(n)}
          >
            <FiBell size={14} className={styles["NotificationList-icon"]} />
            <div className={styles["NotificationList-content"]}>
              <div className={styles["NotificationList-headerRow"]}>
                <strong>공유 알림</strong>
                <span className={styles["NotificationList-time"]}>
                  {dayjs(n.createdAt).fromNow()}
                </span>
              </div>
              <p>{n.memberName}님이 {n.chatName}을(를) 공유했습니다.</p>
            </div>
          </div>
        ))
      )}
      {showModal && selectedInfo && (
        <NotificationModal
          notificationId={selectedInfo.notificationId}
          chatId={selectedInfo.chatId}
          chatName={selectedInfo.chatName}
          memberName={selectedInfo.memberName}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default NotificationList;

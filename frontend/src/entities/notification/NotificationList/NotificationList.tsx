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
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

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
    setSelectedChatId(n.chatId);
    setShowModal(true);
  };

  return (
    <>
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
            <FiBell size={16} className={styles["NotificationList-icon"]} />
            <div className={styles["NotificationList-content"]}>
              <div className={styles["NotificationList-headerRow"]}>
                <strong>공유 알림</strong>
                <span className={styles["NotificationList-time"]}>
                  {dayjs(n.createdAt).fromNow()}
                </span>
              </div>
              <p>{n.content}</p>
            </div>
          </div>
        ))
      )}
      {showModal && selectedChatId && (
        <NotificationModal
          chatId={selectedChatId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default NotificationList;

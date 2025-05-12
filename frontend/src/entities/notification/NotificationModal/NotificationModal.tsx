import React, { Suspense } from "react";
import styles from "./NotificationModal.module.css";
import ChatPreview from "../ChatPreview/ChatPreview";
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import Button from "@/shared/ui/Button/Button";
import { useNavigate } from "react-router-dom";
import { showSuccessToast } from "@/shared/toast";

interface Props {
  notificationId: number;
  chatId: string;
  chatName: string;
  memberName: string;
  onClose: () => void;
}

const NotificationModal: React.FC<Props> = ({ notificationId, chatId, chatName, memberName, onClose }) => {
  const navigate = useNavigate();
  const { mutate: acceptChat, isPending } = useMutation({
    mutationFn: () =>
      api.post("/chats/share/allow", {
        notificationId,
        accepted: true,
      }),
    onSuccess: () => {
      showSuccessToast("채팅이 내 채팅으로 저장되었습니다!");
      onClose();
      navigate(`/chat/${chatId}`);
    },
  });

  return (
    <div className={styles["NotificationModal-overlay"]} onClick={onClose}>
      <div
        className={styles["NotificationModal-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles["NotificationModal-title"]}>
          {chatName || "채팅 제목 없음"}
          <span className={styles["NotificationModal-subtitle"]}>
            ({memberName || "이름 없음"}님이 공유)
          </span>
        </h2>
        <Suspense fallback={null}>
          <div className={styles["NotificationModal-previewWrapper"]}>
            <ChatPreview chatId={chatId} />
          </div>
        </Suspense>
         <div className={styles["NotificationModal-buttonRow"]}>
          <Button
            label="취소"
            onClick={onClose}
            borderColor="var(--icon-blue)"
            backgroundColor="transparent"
            textColor="var(--icon-blue)"
          />
          <Button
            label={isPending ? "저장 중..." : "내 채팅으로 저장"}
            onClick={() => acceptChat()}
            borderColor="var(--icon-blue)"
            backgroundColor="var(--icon-blue)"
            textColor="#fff"
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

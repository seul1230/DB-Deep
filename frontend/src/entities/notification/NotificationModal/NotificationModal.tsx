import React, { Suspense } from "react";
import styles from "./NotificationModal.module.css";
import ChatPreview from "../ChatPreview/ChatPreview";
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/api/axios";
import Button from "@/shared/ui/Button/Button";

interface Props {
  chatId: string;
  onClose: () => void;
}

const NotificationModal: React.FC<Props> = ({ chatId, onClose }) => {
  const { mutate: acceptChat, isPending } = useMutation({
    mutationFn: () =>
      api.post("/chats/allow", {
        accepted: true,
      }),
    onSuccess: () => {
      alert("채팅이 내 채팅으로 저장되었습니다!");
      onClose();
    },
  });

  return (
    <div className={styles["NotificationModal-overlay"]} onClick={onClose}>
      <div
        className={styles["NotificationModal-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles["NotificationModal-title"]}>분기별 성과 보고서</h2>
        <Suspense fallback={<div>로딩 중...</div>}>
          <ChatPreview chatId={chatId} />
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

// src/widgets/ChatLogPanel/ChatLogPanel.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatLogPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useChatRooms } from "@/features/chat/useChatRooms";
import dayjs from "dayjs";

const ChatLogPanel: React.FC = () => {
  const { closePanel } = usePanelStore();
  const { data, isLoading, isError } = useChatRooms();

  const navigate = useNavigate();

  const handleClickChatRoom = (chatId: string) => {
    navigate(`/chat/1`);
    console.log("chatId: "+1);
    console.log("chatId: "+chatId);
  };

  return (
    <div className={styles.ChatLogPanel}>
      <div className={styles["ChatLogPanel-header"]}>
        <span>채팅 로그</span>
        <button
          onClick={closePanel}
          className={styles["ChatLogPanel-close"]}
        >
          ×
        </button>
      </div>

      <div className={styles["ChatLogPanel-list"]}>
        {isLoading && <p>로딩 중...</p>}
        {isError && <p>채팅방을 불러오는 데 실패했습니다.</p>}

        {data?.chatRooms.map((log) => (
          <div
            key={log.id}
            className={styles["ChatLogPanel-item"]}
            onClick={() => handleClickChatRoom(log.id)} // ← 추가
            role="button"
            tabIndex={0}
          >
            <div className={styles["ChatLogPanel-content"]}>
              <span className={styles["ChatLogPanel-title"]}>
                {log.title}
              </span>
              <span className={styles["ChatLogPanel-date"]}>
                {dayjs(log.lastMessageAt).format("YYYY년 M월 D일")}
              </span>
            </div>
            <span className={styles["ChatLogPanel-menu"]}>⋯</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatLogPanel;

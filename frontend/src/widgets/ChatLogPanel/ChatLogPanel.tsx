import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatLogPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useChatRooms } from "@/features/chat/useChatRooms";
import dayjs from "dayjs";
import ChatLogItemMenu from "../ChatLogOverlay/ChatLogItemMenu";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";

const ChatLogPanel: React.FC = () => {
  const { closePanel } = usePanelStore();
  const { data, isLoading, isError } = useChatRooms();
  const {
    closeMenu,
    isMenuOpen,
    selectedChatId,
    menuPosition,
    toggleMenuForChatId,
  } = useOverlayStore();

  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClickChatRoom = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
  
      const clickedInsideMenu =
        menuRef.current && menuRef.current.contains(target);
  
      const clickedTrigger = target.closest("[data-chat-menu-trigger]");
  
      if (!clickedInsideMenu && !clickedTrigger) {
        closeMenu();
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);
  

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
            onClick={() => handleClickChatRoom(log.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles["ChatLogPanel-content"]}>
              <span className={styles["ChatLogPanel-title"]}>{log.title}</span>
              <span className={styles["ChatLogPanel-date"]}>
                {dayjs(log.lastMessageAt).format("YYYY년 M월 D일")}
              </span>
            </div>
            <span
              className={styles["ChatLogPanel-menu"]}
              data-chat-menu-trigger
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                toggleMenuForChatId(log.id, {
                  top: rect.top + window.scrollY,
                  left: rect.left,
                });
              }}
            >
              ⋯
            </span>
          </div>
        ))}
      </div>

      {isMenuOpen && selectedChatId && menuPosition && (
        <ChatLogItemMenu
          ref={menuRef}
          position={menuPosition}
          onClose={closeMenu}
          onSaveToProject={() => {
            closeMenu();
          }}
          selectedChatId={selectedChatId}
        />
      )}
    </div>
  );
};

export default ChatLogPanel;

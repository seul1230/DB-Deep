import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ChatLogPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useChatRooms } from "@/features/chat/useChatRooms";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";
import { updateChatTitle, deleteChatRoom } from "@/features/chat/chatApi";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import ChatLogItemMenu from "../ChatLogOverlay/ChatLogItemMenu";
import DeleteConfirmModal from "@/shared/ui/DeleteConfirmModal/DeleteConfirmModal";

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

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState<string | null>(null);

  const handleClickChatRoom = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };
  

  const handleEditComplete = async (chatId: string) => {
    if (!editedTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateChatTitle(chatId, editedTitle);
      await queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    } catch (err) {
      console.error("제목 수정 실패:", err);
      alert("채팅방 제목 수정에 실패했습니다.");
    } finally {
      setEditingId(null);
    }
  };

  const handleDeleteChatRoom = async () => {
    if (!chatIdToDelete) return;
    try {
      await deleteChatRoom(chatIdToDelete);
      await queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    } catch (err) {
      console.error("삭제 실패", err);
      alert("채팅 삭제에 실패했습니다.");
    } finally {
      setShowDeleteModal(false);
      setChatIdToDelete(null);
    }
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
        {!isLoading && !isError && data?.chatRooms.length === 0 && (
          <p className={styles.emptyMessage}>채팅방이 없습니다.</p>
        )}

        {data?.chatRooms.map((log) => (
          <div
            key={log.id}
            className={`${styles["ChatLogPanel-item"]} ${
              chatId === log.id ? styles["ChatLogPanel-item--active"] : ""
            }`}
            onClick={() => handleClickChatRoom(log.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles["ChatLogPanel-content"]}>
              {editingId === log.id ? (
                <input
                  className={styles["ChatLogPanel-titleInput"]}
                  value={editedTitle}
                  autoFocus
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onBlur={() => handleEditComplete(log.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditComplete(log.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <span
                  className={styles["ChatLogPanel-title"]}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(log.id);
                    setEditedTitle(log.title);
                  }}
                >
                  {log.title}
                </span>
              )}

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
          selectedChatId={selectedChatId}
          onRequestTitleEdit={(chatId) => {
            const chat = data?.chatRooms.find((c) => c.id === chatId);
            if (chat) {
              setEditingId(chatId);
              setEditedTitle(chat.title);
            }
          }}
          onRequestDelete={(chatId) => {
            setChatIdToDelete(chatId);
            setShowDeleteModal(true);
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="채팅방 삭제"
          message={
            <>
              <strong style={{ fontWeight: 700 }}>
                "{data?.chatRooms.find((c) => c.id === chatIdToDelete)?.title}"
              </strong>
              &nbsp;채팅방을 삭제하시겠습니까?
              <br />
              삭제된 채팅방은 복구할 수 없습니다.
            </>
          }
          onCancel={() => {
            setShowDeleteModal(false);
            setChatIdToDelete(null);
          }}
          onConfirm={handleDeleteChatRoom}
        />
      )}
    </div>
  );
};

export default ChatLogPanel;

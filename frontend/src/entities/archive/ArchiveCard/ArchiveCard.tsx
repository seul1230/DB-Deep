import { useEffect, useRef, useState } from "react";
import styles from "./ArchiveCard.module.css";
import { ArchiveItem } from "@/features/archive/archiveTypes";
import { ChatBubbleDBDeep } from "@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep";
import { CustomChartData } from "@/types/chart";
import { convertLastMessageToParts } from "@/features/archive/convertLastMessageToParts";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import DeleteConfirmModal from "@/shared/ui/DeleteConfirmModal/DeleteConfirmModal";
import { deleteArchive } from "@/features/archive/archiveApi";

interface ArchiveCardProps {
  archive: ArchiveItem;
  onClick?: () => void;
  onChartClick: (data: CustomChartData) => void;
  isActive?: boolean;
  onDeleteSuccess?: (id: string) => void;
}

export const ArchiveCard = ({
  archive,
  onClick,
  onChartClick,
  isActive,
  onDeleteSuccess,
}: ArchiveCardProps) => {
  const parts = convertLastMessageToParts(archive.lastMessage);
  const moreIconRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const preventClickRef = useRef(false);

  const {
    toggleOverlayForTarget,
    isOpen,
    targetId,
    position,
    closeOverlay,
  } = useCardOverlayStore();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = moreIconRef.current?.getBoundingClientRect();
    if (rect) {
      toggleOverlayForTarget(
        {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX + 8,
        },
        archive.archiveId.toString()
      );
    }
  };

  const handleDelete = async () => {
    preventClickRef.current = true;
    setIsDeleting(true);
    try {
      await deleteArchive(archive.archiveId.toString());
      onDeleteSuccess?.(archive.archiveId.toString());
    } catch (e) {
      console.error("삭제 실패:", e);
    } finally {
      setShowDeleteModal(false);
      setTimeout(() => {
        preventClickRef.current = false;
      }, 300);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeOverlay();
        setShowDeleteModal(false);
      }
    };

    const handleScroll = () => {
      closeOverlay();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [closeOverlay]);

  return (
    <div
      ref={cardRef}
      className={`${styles.archiveCardWrapper} ${isActive ? styles.active : ""}`}
      onClick={(e) => {
        if (preventClickRef.current || isDeleting) {
          e.stopPropagation();
          return;
        }
        onClick?.();
      }}
    >
      <div className={styles.archiveCardHeader}>
        <div className={styles.headerLeft}>
          <FiMessageSquare className={styles.icon} />
          <div className={styles.title}>{archive.chatName}</div>
          <div className={styles.date}>{new Date(archive.archivedAt).toLocaleString()}</div>
        </div>
        <div
          className={styles.moreIcon}
          onClick={handleMoreClick}
          ref={moreIconRef}
        >
          <FiMoreVertical />
        </div>
      </div>

      <div className={styles.archiveCardContent}>
        <ChatBubbleDBDeep
          parts={parts}
          isLive={false}
          uuid={archive.chatRoomId}
          messageId={archive.messageId}
          onChartClick={onChartClick}
          showMenu={false}
          noBackground
        />
      </div>

      {isOpen && targetId === archive.archiveId.toString() && (
        <div onClick={(e) => e.stopPropagation()}>
          <CardOverlay
            position={position}
            targetId={archive.archiveId.toString()}
            onCopy={() => {
              const text = parts
                .map((p) =>
                  p.type === "text" || p.type === "sql" ? p.content : ""
                )
                .join("\n");
              navigator.clipboard.writeText(text);
            }}
            onDelete={() => setShowDeleteModal(true)}
            onClose={closeOverlay}
            showDelete
          />
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title="아카이브 삭제"
          message={
            <>
              <strong>{archive.chatName}</strong> 아카이브를 삭제하시겠습니까?
              <br />삭제된 항목은 복구할 수 없습니다.
            </>
          }
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ArchiveCard;
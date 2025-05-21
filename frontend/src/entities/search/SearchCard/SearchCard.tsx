import { useRef } from "react";
import styles from "./SearchCard.module.css";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import { ChatBubbleDBDeep } from "@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import { SearchChatResult } from "@/features/search/searchTypes";
import { convertSearchMessageToParts } from "@/features/search/convertSearchMessageToParts";
import { CustomChartData } from "@/types/chart";

interface SearchCardProps {
  chat: SearchChatResult;
  onClick?: () => void;
  onChartClick: (chartData: CustomChartData) => void;
}

const SearchCard = ({ chat, onClick, onChartClick }: SearchCardProps) => {
  const moreIconRef = useRef<HTMLDivElement>(null);
  const {
    toggleOverlayForTarget,
    isOpen,
    targetId,
    position,
    closeOverlay,
  } = useCardOverlayStore();

  if (!chat || !chat.message) return null;

  const parts = convertSearchMessageToParts(chat.message);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = moreIconRef.current?.getBoundingClientRect();
    if (rect) {
      toggleOverlayForTarget(
        {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX + 8,
        },
        chat.chatId
      );
    }
  };

  return (
    <div className={styles.searchCardWrapper} onClick={onClick}>
      <div className={styles.searchCardHeader}>
        <div className={styles.headerLeft}>
          <FiMessageSquare className={styles.icon} />
          <div className={styles.title}>{chat.title}</div>
          <div className={styles.date}>
            {new Date(chat.updatedAt).toLocaleString()}
          </div>
        </div>
        <div
          className={styles.moreIcon}
          onClick={handleMoreClick}
          ref={moreIconRef}
        >
          <FiMoreVertical />
        </div>
      </div>

      <div className={styles.searchCardContent}>
        <ChatBubbleDBDeep
          parts={parts}
          isLive={false}
          uuid={chat.chatId}
          messageId={chat.chatId}
          onChartClick={onChartClick}
          showMenu={false}
          noBackground
        />
      </div>

      {isOpen && targetId === chat.chatId && (
        <div onClick={(e) => e.stopPropagation()}>
          <CardOverlay
            position={position}
            targetId={chat.chatId}
            onCopy={() => {
              const text = parts
                .map((p) =>
                  p.type === "text" || p.type === "sql" ? p.content : ""
                )
                .join("\n");
              navigator.clipboard.writeText(text);
            }}
            onClose={closeOverlay}
            showDelete={false}
          />
        </div>
      )}
    </div>
  );
};

export default SearchCard;

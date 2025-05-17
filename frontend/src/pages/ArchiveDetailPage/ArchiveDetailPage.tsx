import { useLocation } from "react-router-dom";
import styles from "./ArchiveDetailPage.module.css";
import { ArchiveItem } from "@/features/archive/archiveTypes";
import { convertToStreamMessage, ChatMessage } from "@/features/chat/chatTypes";
import ArchivedChatBubble from "@/entities/archive/ArchiveChatBubble/ArchivedChatBubble"

const ArchiveDetailPage = () => {
  const location = useLocation();
  const archive = location.state as ArchiveItem;

  if (!archive) {
    return <div className={styles.error}>❌ 잘못된 접근입니다.</div>;
  }

  const archivedChatMessage: ChatMessage = {
    id: archive.messageId,
    uuid: archive.chatRoomId,
    content: archive.lastMessage,
    memberId: 0,
    senderType: "ai" as const,
    timestamp: { seconds: 0, nanos: 0 },
  };

  const streamMessage = convertToStreamMessage(archivedChatMessage);

  return (
    <div className={styles["chatDetailPage-outer"]}>
      <div className={styles["chatDetailPage-contentWrapper"]}>
        <ArchivedChatBubble message={streamMessage} />
      </div>
    </div>
  );
};

export default ArchiveDetailPage;

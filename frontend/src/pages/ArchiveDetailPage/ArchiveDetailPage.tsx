import { useLocation } from "react-router-dom";
import styles from "./ArchiveDetailPage.module.css";
import { ArchiveItem } from "@/features/archive/archiveTypes";
import { convertArchiveToParsedContent } from "@/features/archive/convertArchiveToParsedContent";
import { convertToStreamMessage } from "@/features/chat/chatTypes";
import ArchivedChatBubble from "@/entities/archive/ArchiveChatBubble/ArchivedChatBubble";
import ChartOverlay from "@/entities/chat/ChartOverlay/ChartOverlay";
import { useState } from "react";
import { CustomChartData } from "@/types/chart";

const ArchiveDetailPage = () => {
  const location = useLocation();
  const archive = location.state as ArchiveItem;
  const [chart, setChart] = useState<CustomChartData | null>(null);

  if (!archive) {
    return <div className={styles.error}>❌ 잘못된 접근입니다.</div>;
  }

  const parsedContent = convertArchiveToParsedContent(archive.lastMessage);

  const streamMessage = convertToStreamMessage({
    id: archive.messageId,
    uuid: archive.chatRoomId,
    memberId: 0,
    senderType: "ai",
    timestamp: { seconds: 0, nanos: 0 },
    content: parsedContent,
  });

  return (
    <div className={styles["chatDetailPage-outer"]}>
      <div className={styles["chatDetailPage-contentWrapper"]}>
        <ArchivedChatBubble
          message={streamMessage}
          onChartClick={(c) => {
            setChart(c);
          }}
        />
      </div>

      {chart && (
  <>
    <ChartOverlay chartData={chart} onClose={() => setChart(null)} />
  </>
)}

    </div>
  );
};

export default ArchiveDetailPage;

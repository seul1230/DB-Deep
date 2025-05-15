import { useParams } from "react-router-dom";
import { useEffect } from "react";
import styles from "./ArchiveDetailPage.module.css";
import ChatList from "@/shared/ui/Chat/ChatList/ChatList";
import { fetchChatDetail } from "@/features/chat/chatApi";
import { convertToStreamMessage } from "@/features/chat/chatTypes";
import { useChatMessageStore } from "@/features/chat/useChatMessageStore";

const ArchiveDetailPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { messages, setMessages } = useChatMessageStore();
  const chatMessages = chatRoomId ? messages[chatRoomId] || [] : [];

  useEffect(() => {
    if (!chatRoomId) return;

    fetchChatDetail(chatRoomId).then((res) => {
      const converted = res.messages.map(convertToStreamMessage);
      setMessages(chatRoomId, converted);
    });
  }, [chatRoomId, setMessages]);

  const handleChartClick = (chartId: string) => {
    console.log(`Chart clicked: ${chartId}`);
  };

  return (
    <div className={styles["chatDetailPage-outer"]}>
      <div className={styles["chatDetailPage-contentWrapper"]}>
        {chatRoomId && (
          <ChatList
            chatId={chatRoomId}
            chatList={chatMessages}
            onChartClick={handleChartClick}
            scrollToBottom
          />
        )}
      </div>
    </div>
  );
};

export default ArchiveDetailPage;

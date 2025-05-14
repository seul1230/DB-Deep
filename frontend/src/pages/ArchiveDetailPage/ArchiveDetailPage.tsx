import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import styles from "./ArchiveDetailPage.module.css";
import ChatList from "@/shared/ui/Chat/ChatList/ChatList";
import { fetchChatDetail } from "@/features/chat/chatApi";
import { convertToStreamMessage } from "@/features/chat/chatTypes";
import { useChatMessageStore } from "@/features/chat/useChatMessageStore";
import { usePanelStore } from "@/shared/store/usePanelStore";

const PANEL_WIDTH = 240;

const ArchiveDetailPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { openPanel } = usePanelStore();
  const { messages, setMessages } = useChatMessageStore();
  const chatMessages = chatId ? messages[chatId] || [] : [];

  const isAnyPanelOpen = !!openPanel;
  const leftOffset = isAnyPanelOpen ? PANEL_WIDTH + 68 : 0;

  useEffect(() => {
    if (!chatId) return;

    fetchChatDetail(chatId).then((res) => {
      const converted = res.messages.map(convertToStreamMessage);
      setMessages(chatId, converted);
    });
  }, [chatId, setMessages]);

  const handleChartClick = (chartId: string) => {
    console.log(`Chart clicked: ${chartId}`);
  };

  return (
    <div className={styles["chatDetailPage-outer"]}>
      <div className={styles["chatDetailPage-contentWrapper"]}>
        {chatId && (
          <ChatList
            chatId={chatId}
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

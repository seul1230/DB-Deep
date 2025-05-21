import React from "react";
import { ChatStreamMessage } from "@/features/chat/chatTypes";
import { ChatBubbleDBDeep } from "@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep";
import { CustomChartData } from "@/types/chart";

interface Props {
  message: ChatStreamMessage;
  onChartClick: (chartData: CustomChartData) => void;
}

const ArchivedChatBubble: React.FC<Props> = ({ message, onChartClick }) => {
  return (
    <ChatBubbleDBDeep
      parts={message.parts}
      isLive={false}
      uuid={message.uuid}
      messageId={message.id}
      onChartClick={onChartClick}
      showMenu={false}
    />
  );
};

export default ArchivedChatBubble;

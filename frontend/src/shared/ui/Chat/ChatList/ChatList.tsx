import React from 'react';
import { ChatBubbleUser } from '@/shared/ui/Chat/ChatBubbleUser/ChatBubbleUser';
import { ChatBubbleDBDeep } from '@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep';
import { ChatStreamMessage } from '@/features/chat/chatTypes';
import styles from './ChatList.module.css';

interface Props {
  chatId: string;
  chatList: ChatStreamMessage[];
  onChartClick?: (chartId: string) => void;
  scrollToBottom?: boolean;
  showMenu?: boolean;
}

const ChatList: React.FC<Props> = ({
  chatId,
  chatList,
  onChartClick,
  showMenu = true,
}) => {
  return (
    <div className={styles['ChatList-scrollArea']}>
      <div className={styles['ChatList-chatBox']}>
        {chatList.map((msg) =>
          msg.senderType === 'user' ? (
            <ChatBubbleUser key={msg.id} text={msg.parts.find(p => p.type === 'text')?.content ?? ''} />
          ) : (
            <ChatBubbleDBDeep
              key={msg.id}
              parts={msg.parts}
              isLive={msg.isLive}
              uuid={chatId}
              messageId={msg.id}
              onChartClick={onChartClick ?? (() => {})}
              showMenu={showMenu}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ChatList;

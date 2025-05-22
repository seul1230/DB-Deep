import React from 'react';
import { ChatBubbleUser } from '@/shared/ui/Chat/ChatBubbleUser/ChatBubbleUser';
import { ChatBubbleDBDeep } from '@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep';
import { ChatStreamMessage } from '@/features/chat/chatTypes';
import styles from './ChatList.module.css';
import { CustomChartData } from '@/types/chart';

interface Props {
  chatId: string;
  chatList: ChatStreamMessage[];
  onChartClick?: (chartData: CustomChartData) => void;
  showMenu?: boolean;
  onRetry?: (message: ChatStreamMessage) => void;
}

const ChatList: React.FC<Props> = ({
  chatId,
  chatList,
  onChartClick,
  showMenu = true,
  onRetry,
}) => {
  return (
    <div className={styles['ChatList-scrollArea']}>
      <div className={styles['ChatList-chatBox']}>
        {chatList.map((msg) => {
          if (msg.senderType === 'user') {
            return (
              <ChatBubbleUser
                key={msg.id}
                text={msg.parts.find(p => p.type === 'text')?.content ?? ''}
                showRetryButton={msg.hasError}
                onRetry={() => onRetry?.(msg)}
              />
            );
          }

          return (
            <ChatBubbleDBDeep
              key={msg.id}
              parts={msg.parts}
              isLive={msg.isLive}
              uuid={msg.uuid}
              messageId={msg.id}
              onChartClick={onChartClick ?? (() => {})}
              showMenu={showMenu}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;

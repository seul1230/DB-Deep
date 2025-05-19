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
            const userText = msg.parts.find(p => p.type === 'text')?.content ?? '';
            const aiError = chatList.find(
              m => m.senderType === 'ai' &&
              m.uuid === msg.uuid &&
              m.parts.some(p =>
                p.type === 'text' &&
                p.content.includes('서버 처리 중 오류')
              )
            );

            return (
              <ChatBubbleUser
                key={msg.id}
                text={userText}
                showRetryButton={!!aiError}
                onRetry={() => onRetry?.(msg)}
              />
            );
          }

          return (
            <ChatBubbleDBDeep
              key={msg.id}
              parts={msg.parts}
              isLive={msg.isLive}
              uuid={chatId}
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

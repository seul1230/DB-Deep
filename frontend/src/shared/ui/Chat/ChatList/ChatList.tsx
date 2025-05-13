import React, { useEffect, useRef } from 'react';
import { ChatBubbleUser } from '@/shared/ui/Chat/ChatBubbleUser/ChatBubbleUser';
import { ChatBubbleDBDeep } from '@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep';
import { ChatStreamMessage } from '@/features/chat/chatTypes';
import styles from './ChatList.module.css';

interface Props {
  chatId: string;
  chatList: ChatStreamMessage[]; // ✅ 타입 수정
  onChartClick?: (chartId: string) => void;
  scrollToBottom?: boolean;
  showMenu?: boolean;
}

const ChatList: React.FC<Props> = ({ chatId, chatList, onChartClick, scrollToBottom, showMenu = true }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToBottom && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatList, scrollToBottom]);

  return (
    <div className={styles['ChatList-scrollArea']} ref={scrollRef}>
      <div className={styles['ChatList-chatBox']}>
        {chatList.map((msg) => {
          if (msg.senderType === 'USER') {
            const textPart = msg.parts.find(p => p.type === 'text');
            return (
              <ChatBubbleUser
                key={msg.id}
                text={textPart?.content ?? ''}
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

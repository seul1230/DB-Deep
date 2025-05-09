import React, { useEffect, useRef } from 'react';
import { ChatBubbleUser } from '@/shared/ui/Chat/ChatBubbleUser/ChatBubbleUser';
import { ChatBubbleDBDeep } from '@/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep';
import { ChatMessage } from '@/features/chat/chatTypes';
import styles from './ChatList.module.css';

interface Props {
  chatList: ChatMessage[];
  onChartClick?: (chartId: string) => void;
  scrollToBottom?: boolean;
}

const ChatList: React.FC<Props> = ({ chatList, onChartClick, scrollToBottom }) => {
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
      {chatList.map((msg, index) => {
          const isLast = index === chatList.length - 1;
          const isLive = isLast && msg.senderType === 'AI';

          return msg.senderType === 'USER' ? (
            <ChatBubbleUser key={msg.id} text={msg.content} />
          ) : (
            <ChatBubbleDBDeep
              key={msg.id}
              text={msg.content}
              onChartClick={onChartClick || (() => {})}
              isLive={isLive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;

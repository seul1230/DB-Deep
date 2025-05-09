import React, { useEffect, useState } from 'react';
import ChatList from '@/shared/ui/chat/ChatList/ChatList';
import { fetchChatDetail } from '@/features/chat/chatApi';
import { ChatMessage } from '@/features/chat/chatTypes';
import styles from './ChatPreview.module.css';

interface Props {
  chatId: string;
}

const ChatPreview: React.FC<Props> = ({ chatId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (chatId) {
      fetchChatDetail(chatId).then((detail) => setMessages(detail.messages));
    }
  }, [chatId]);

  return (
    <div className={styles['ChatPreview-container']}>
      <div className={styles['ChatPreview-scrollArea']}>
        <ChatList chatList={messages} />
      </div>
    </div>
  );
};

export default ChatPreview;

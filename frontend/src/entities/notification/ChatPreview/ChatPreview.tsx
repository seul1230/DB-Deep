import React, { useEffect, useState } from 'react';
import ChatList from '@/shared/ui/Chat/ChatList/ChatList';
import { fetchChatDetail } from '@/features/chat/chatApi';
import { ChatMessage } from '@/features/chat/chatTypes';
import styles from './ChatPreview.module.css';
import { convertToStreamMessage } from '@/features/chat/chatTypes';

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
        <ChatList chatId={chatId} chatList={messages.map(convertToStreamMessage)} showMenu={false} />
      </div>
    </div>
  );
};

export default ChatPreview;

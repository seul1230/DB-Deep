import { useParams } from 'react-router-dom';
import React, { useEffect, useState, Suspense } from 'react';
import ChatList from '@/shared/ui/Chat/ChatList/ChatList';
import QuestionInput from '@/shared/ui/QuestionInput/QuestionInput';
import Button from '@/shared/ui/Button/Button';
import styles from './ChatDetailPage.module.css';
import { fetchChatDetail } from '@/features/chat/chatApi';
import { ChatMessage } from '@/features/chat/chatTypes';

const TeamMemberSelectModal = React.lazy(() =>
  import('@/entities/chat/TeamMemberSelectModal/TeamMemberSelectModal')
);

const ChatDetailPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (chatId) {
      fetchChatDetail(chatId).then((detail) => setMessages(detail.messages));
    }
  }, [chatId]);

  const handleChartClick = (chartId: string) => {
    console.log(`Chart clicked: ${chartId}`);
  };

  return (
    <div className={styles['chatDetailPage-outer']}>
      <div className={styles['chatDetailPage-contentWrapper']}>
        <ChatList chatList={messages} onChartClick={handleChartClick} scrollToBottom />
        <div className={styles['chatDetailPage-inputWrapper']}>
          <div className={styles['chatDetailPage-inputArea']}>
            <QuestionInput onChange={(text) => console.log('입력:', text)} />
            <Button
              label="지금까지의 채팅 공유"
              onClick={() => setShowModal(true)}
              borderColor="var(--icon-blue)"
              backgroundColor="var(--icon-blue)"
              textColor="var(--background-color)"
            />
          </div>
        </div>
      </div>
      <Suspense fallback={<div style={{ display: 'none' }} />}>
        {showModal && (
          <TeamMemberSelectModal
            onClose={() => setShowModal(false)}
            onSelect={(memberId) => {
              alert(`팀원 ${memberId}에게 공유했습니다!`);
              setShowModal(false);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ChatDetailPage;

import { useParams } from 'react-router-dom';
import React, { useEffect, useState, Suspense } from 'react';
import ChatList from '@/shared/ui/Chat/ChatList/ChatList';
import QuestionInput from '@/shared/ui/QuestionInput/QuestionInput';
import Button from '@/shared/ui/Button/Button';
import styles from './ChatDetailPage.module.css';
import { fetchChatDetail } from '@/features/chat/chatApi';
import { usePanelStore } from '@/shared/store/usePanelStore';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import { useQuestionInput } from '@/features/chat/useChatInput';
import { useChatSocket } from '@/features/chat/useChatSocket';
import { sendMessage } from '@/shared/api/socketManager';
import { convertToStreamMessage } from '@/features/chat/chatTypes';
import { useAuth } from '@/features/auth/useAuth';

const TeamMemberSelectModal = React.lazy(() =>
  import('@/entities/chat/TeamMemberSelectModal/TeamMemberSelectModal')
);

const PANEL_WIDTH = 240;

const ChatDetailPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { messages, setMessages } = useChatMessageStore();
  const { openPanel } = usePanelStore();
  const { profile } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const chatMessages = chatId ? messages[chatId] || [] : [];

  const isAnyPanelOpen = !!openPanel;
  const leftOffset = isAnyPanelOpen ? PANEL_WIDTH + 68 : 0;

  // ✅ useQuestionInput은 무조건 실행되어야 함
  const { value, onChange, onSubmit } = useQuestionInput((text) => {
    if (!chatId) return;
    sendMessage({
      uuid: chatId,
      question: text,
      department: profile?.teamName ?? '알 수 없음',
    });
  });

  useChatSocket(chatId); // 내부에서 chatId 없으면 처리하도록

  // ✅ useEffect도 무조건 호출되도록!
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
    <div className={styles['chatDetailPage-outer']}>
      <div className={styles['chatDetailPage-contentWrapper']}>
        {chatId && (
          <ChatList
            chatId={chatId}
            chatList={chatMessages}
            onChartClick={handleChartClick}
            scrollToBottom
          />
        )}
      </div>

      <div
        className={styles['chatDetailPage-inputWrapper']}
        style={{ paddingLeft: `${leftOffset}px` }}
      >
        <div className={styles['chatDetailPage-inputContainer']}>
          <div className={styles['chatDetailPage-inputArea']}>
            <QuestionInput value={value} onChange={onChange} onSubmit={onSubmit} />
            <Button
              label="지금까지의 채팅 공유"
              onClick={() => setShowModal(true)}
              borderColor="var(--icon-blue)"
              backgroundColor="var(--icon-blue)"
              textColor="var(--background-color)" />
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

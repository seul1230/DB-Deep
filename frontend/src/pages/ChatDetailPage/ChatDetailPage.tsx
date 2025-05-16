// ChatDetailPage.tsx
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, Suspense, useRef, useMemo } from 'react';
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
import { ChartOverlay } from '@/entities/chat/ChartOverlay/ChartOverlay';

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
  const chatMessages = useMemo(() => {
    return chatId ? messages[chatId] || [] : [];
  }, [chatId, messages]);

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const isAnyPanelOpen = !!openPanel;
  const leftOffset = isAnyPanelOpen ? PANEL_WIDTH + 68 : 0;

  const { value, onChange, onSubmit } = useQuestionInput((text) => {
    if (!chatId) return;
    sendMessage({
      uuid: chatId,
      question: text,
      user_department: profile?.teamName ?? '알 수 없음',
    });
    setShouldScrollToBottom(true);
  });

  useChatSocket(chatId);

  useEffect(() => {
    if (!chatId) return;
    fetchChatDetail(chatId).then((res) => {
      const converted = res.messages.map(convertToStreamMessage);
      setMessages(chatId, converted);
      setShouldScrollToBottom(true);
    });
  }, [chatId, setMessages]);

  useEffect(() => {
    if (shouldScrollToBottom && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [chatMessages, shouldScrollToBottom]);

  const handleChartClick = (chartId: string) => {
    console.log(`Chart clicked: ${chartId}`);
  };

  return (
    <div className={styles['chatDetailPage-outer']}>
      <div className={styles['chatDetailPage-scrollContainer']} ref={scrollContainerRef}>
        <div className={styles['chatDetailPage-contentWrapper']}>
          {chatId && (
            <>
              <ChatList
                chatId={chatId}
                chatList={chatMessages}
                onChartClick={handleChartClick}
              />
              <div ref={scrollBottomRef} style={{ height: '0px' }} />
            </>
          )}
        </div>
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

      <ChartOverlay />
    </div>
  );
};

export default ChatDetailPage;
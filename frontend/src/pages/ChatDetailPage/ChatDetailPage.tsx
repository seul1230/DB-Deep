import { useParams } from 'react-router-dom';
import React, { useEffect, useState, Suspense, useRef, useMemo } from 'react';
import ChatList from '@/shared/ui/Chat/ChatList/ChatList';
import QuestionInput from '@/shared/ui/QuestionInput/QuestionInput';
import Button from '@/shared/ui/Button/Button';
import styles from './ChatDetailPage.module.css';
import { fetchChatDetail } from '@/features/chat/chatApi';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import { useQuestionInput } from '@/features/chat/useQuestionInput';
import { sendMessageSafely } from '@/shared/api/socketManager';
import { convertToStreamMessage } from '@/features/chat/chatTypes';
import { useAuth } from '@/features/auth/useAuth';
import ChartOverlay from '@/entities/chat/ChartOverlay/ChartOverlay';
import { CustomChartData } from '@/types/chart';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';

const TeamMemberSelectModal = React.lazy(() =>
  import('@/entities/chat/TeamMemberSelectModal/TeamMemberSelectModal')
);
const GlossaryModal = React.lazy(() =>
  import('@/entities/chat/GlossaryModal/GlossaryModal')
);

const ChatDetailPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const {
    messages,
    startUserMessage,
    startLiveMessage,
  } = useChatMessageStore();
  const { profile } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [showChartOverlay, setShowChartOverlay] = useState(false);
  const [overlayChartData, setOverlayChartData] = useState<CustomChartData | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const chatMessages = useMemo(() => {
    return chatId ? messages[chatId] || [] : [];
  }, [chatId, messages]);

  const { value, onChange, onSubmit } = useQuestionInput(async (text) => {
    if (!chatId) return;

    startUserMessage(chatId, text);
    startLiveMessage(chatId);

    await sendMessageSafely({
      chatId,
      department: profile?.teamName ?? '알 수 없음',
      question: text,
    });

    setShouldScrollToBottom(true);
  });

  useEffect(() => {
    if (!chatId) return;

    const alreadyFetched = useChatMessageStore.getState().messages[chatId]?.length > 0;
    if (alreadyFetched) return;

    fetchChatDetail(chatId).then((res) => {
      const converted = res.messages.map(convertToStreamMessage);
      useChatMessageStore.getState().setMessages(chatId, converted);
      setShouldScrollToBottom(true);
    });
  }, [chatId]);

  useEffect(() => {
    if (shouldScrollToBottom && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [chatMessages, shouldScrollToBottom]);

  useEffect(() => {
    if (showChartOverlay) {
      useWebSocketLogger.getState().setConnected(false);
    }
  }, [showChartOverlay]);

  const layoutStyle = {
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    zIndex: 0,
  };

  return (
    <div className={styles['chatDetailPage-outer']} style={layoutStyle}>
      <div
        className={styles['chatDetailPage-scrollContainer']}
        ref={scrollContainerRef}
        style={{ transition: 'margin 0.3s ease', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <div className={styles['chatDetailPage-contentWrapper']}>
          {chatId && (
            <>
              <ChatList
                chatId={chatId}
                chatList={chatMessages}
                onChartClick={(chartData) => {
                  setOverlayChartData(chartData);
                  setShowChartOverlay(true);
                }}
              />
              <div ref={scrollBottomRef} style={{ height: '0px' }} />
            </>
          )}
        </div>
      </div>

      {!showChartOverlay && (
        <div className={styles['chatDetailPage-inputWrapper']} style={layoutStyle}>
          <div className={styles['chatDetailPage-inputContainer']}>
            <div className={styles['chatDetailPage-inputArea']}>
              <QuestionInput value={value} onChange={onChange} onSubmit={() => onSubmit(chatId!)} />
              <div className={styles['chatDetailPage-buttonGroup']}>
                <Button
                  label="용어 사전"
                  onClick={() => setShowGlossary(true)}
                  borderColor="var(--icon-blue)"
                  backgroundColor="var(--icon-blue)"
                  textColor="var(--background-color)"
                />
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
        </div>
      )}

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

        {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
      </Suspense>

      {showChartOverlay && overlayChartData && (
        <ChartOverlay onClose={() => setShowChartOverlay(false)} chartData={overlayChartData} />
      )}
    </div>
  );
};

export default ChatDetailPage;

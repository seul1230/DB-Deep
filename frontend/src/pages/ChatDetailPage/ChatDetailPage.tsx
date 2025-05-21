// src/pages/ChatDetailPage/ChatDetailPage.tsx
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
import { convertToChartData } from '@/types/chart';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useChatSocket } from '@/features/chat/useChatSocket';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';

const TeamMemberSelectModal = React.lazy(() =>
  import('@/entities/chat/TeamMemberSelectModal/TeamMemberSelectModal')
);
const GlossaryModal = React.lazy(() =>
  import('@/entities/chat/GlossaryModal/GlossaryModal')
);

const ChatDetailPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  useChatSocket(chatId);
  const { messages, insightText } = useChatMessageStore();
  const { profile } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showChartOverlay] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const chatMessages = useMemo(
    () => (chatId ? messages[chatId] || [] : []),
    [chatId, messages]
  );

  const currentInsight = chatId ? insightText[chatId] : undefined;

  const { value, onChange, onSubmit } = useQuestionInput(async (text) => {
    if (!chatId) return;
    await sendMessageSafely({
      chatId,
      department: profile?.teamName ?? '알 수 없음',
      question: text,
    });
    setShouldScrollToBottom(true);
  });

  // 1) 질문 전송 직후 혹은 초기 로드시 한 번만 스크롤
  useEffect(() => {
    if (shouldScrollToBottom && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // 2) 초기 데이터 fetch
  useEffect(() => {
    if (!chatId) return;
    const exists = useChatMessageStore.getState().messages[chatId]?.length > 0;
    if (exists) return;
    fetchChatDetail(chatId).then((res) => {
      const converted = res.messages.map(convertToStreamMessage);
      useChatMessageStore.getState().setMessages(chatId, converted);
      setShouldScrollToBottom(true);
    });
  }, [chatId]);

  // 3) AI 스트림 완전 종료 시 한 번만 스크롤
  useEffect(() => {
    if (currentInsight === '' && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentInsight]);

  // 차트 오버레이 띄울 때 웹소켓 로그 멈추기
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
        style={{ transition: 'margin 0.3s ease', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <div className={styles['chatDetailPage-contentWrapper']}>
          {chatId && (
            <>
              <ChatList
                chatId={chatId}
                chatList={chatMessages}
                onChartClick={(chartData) => {
                  useWebSocketLogger.getState().setConnected(false);
                  useChartOverlayStore.getState().openChart(convertToChartData(chartData));
                }}
              />
              <div ref={scrollBottomRef} style={{ height: 0 }} />
            </>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ChatDetailPage;

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
import { sendMessageSafely, getSocket } from '@/shared/api/socketManager';
import { convertToStreamMessage } from '@/features/chat/chatTypes';
import { useAuth } from '@/features/auth/useAuth';
import { convertToChartData } from '@/types/chart';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useChatSocket } from '@/features/chat/useChatSocket';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';

const TeamMemberSelectModal = React.lazy(() =>
  import('@/entities/chat/TeamMemberSelectModal/TeamMemberSelectModal')
);
const GlossaryModal = React.lazy(() =>
  import('@/entities/chat/GlossaryModal/GlossaryModal')
);

const ChatDetailPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  useChatSocket(chatId);
  const { messages, insightText, setMessages, setInsightText, chatIdMap } = useChatMessageStore();
  const { profile } = useAuth();

  const { setConsoleOpen } = useWebSocketConsoleStore();
  const { setIgnoreConsoleLogs } = useWebSocketLogger();
  const { setIgnoreIncoming } = useChatMessageStore();

  const [showModal, setShowModal] = useState(false);
  const [showChartOverlay] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const stopTimer = useRef<number | null>(null);

  // department 정보
  const department = profile?.teamName ?? '알 수 없음';
  const resolvedChatId = chatIdMap[chatId!] || chatId;
  const rawUuidMessages = messages[chatId!] || [];
  const realId = chatIdMap[chatId!];
  const realIdMessages = realId ? messages[realId] || [] : [];

  const chatMessages = useMemo(() => {
    return realIdMessages.length > 0 ? realIdMessages : rawUuidMessages;
  }, [realIdMessages, rawUuidMessages]);

  const isLoading = useMemo(() => {
    const last = [...chatMessages].reverse().find(m => m.senderType === 'ai');
    return last?.isLive ?? false;
  }, [chatMessages]);

  const currentInsight = chatId ? insightText[chatId] : undefined;

  // 1) 질문 전송 & 2분 자동 중단
  const { value, onChange, onSubmit } = useQuestionInput(async text => {
    if (!chatId) return;

    setInsightText(chatId, () => '');

    // 콘솔 로그 허용
    setIgnoreConsoleLogs(false);
    // 기존 타이머 해제
    if (stopTimer.current) clearTimeout(stopTimer.current);

    // 질문 전송
    await sendMessageSafely({ chatId, department, question: text });
    setShouldScrollToBottom(true);

    // 2분 뒤 자동 중단
    stopTimer.current = window.setTimeout(() => {
      const sock = getSocket();
      sock?.send(JSON.stringify({ type: 'stop' }));
      // 이후 콘솔 로그 무시
      setIgnoreConsoleLogs(true);
      // 진행 중 AI 메시지 제거
      const cur = messages[chatId] || [];
      setMessages(
        chatId,
        cur.filter(m => !(m.senderType === 'ai' && m.isLive))
      );
      alert('⏰ 응답 시간이 초과되었습니다. 좀 더 구체적으로 질문해주세요.');
    }, 2 * 60 * 1000);
  });

  // 2) 중단 버튼
  const handleStop = () => {
    const sock = getSocket();
    sock?.send(JSON.stringify({ type: 'stop' }));
    setIgnoreConsoleLogs(true);
    setIgnoreIncoming(true);
    // 라이브 메시지 제거
    const cur = messages[chatId!] || [];
    setMessages(chatId!, cur.filter(m => !m.isLive));
    // 타이머 해제
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
  };

  // 3) 웹소켓 콘솔 자동 열기
  useEffect(() => {
    setConsoleOpen(true);
  }, [chatId, setConsoleOpen]);

  // 4) 처음 혹은 질문 직후 스크롤
  useEffect(() => {
    if (shouldScrollToBottom && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    // 마지막 AI 메시지
    const lastAI = [...chatMessages].reverse().find(m => m.senderType === 'ai');
    if (!lastAI) return;
    // 메시지 파트가 바뀌었거나, live 상태가 바뀌었을 때
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.map(m => JSON.stringify(m.parts)).join('|'), chatMessages.map(m => m.isLive).join(',')]);

  // 5) 초기 채팅 불러오기
  useEffect(() => {
    if (!chatId) return;
    const exists = useChatMessageStore.getState().messages[chatId]?.length > 0;
    if (exists) return;
    fetchChatDetail(chatId).then(res => {
      const converted = res.messages.map(convertToStreamMessage);
      useChatMessageStore.getState().setMessages(chatId, converted);
      setShouldScrollToBottom(true);
    });
  }, [chatId]);

  // 6) 스트림 완전 종료 시 스크롤 + 타이머/콘솔 복원
  useEffect(() => {
    if (currentInsight === '' && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      // 타이머 해제
      if (stopTimer.current) {
        clearTimeout(stopTimer.current);
        stopTimer.current = null;
      }
      // 콘솔 로그 다시 허용
      setIgnoreConsoleLogs(false);
    }
  }, [currentInsight, setIgnoreConsoleLogs]);

  // 7) 차트 오버레이 중에는 로그 중단
  useEffect(() => {
    if (showChartOverlay) {
      useWebSocketLogger.getState().setConnected(false);
    }
  }, [showChartOverlay]);

  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]);

  const realChatId = useChatMessageStore(state => state.chatIdMap[chatId!]);
  useEffect(() => {
    if (realChatId && stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
  }, [realChatId]);

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
                chatId={chatId!}
                chatList={chatMessages}
                onChartClick={chartData => {
                  useWebSocketLogger.getState().setConnected(false);
                  useChartOverlayStore.getState().openChart(convertToChartData(chartData));
                }}
              />
              <div ref={scrollBottomRef} />
            </>
          )}
        </div>
      </div>

      <div className={styles['chatDetailPage-inputWrapper']} style={layoutStyle}>
        <div className={styles['chatDetailPage-inputContainer']}>
          <div className={styles['chatDetailPage-inputArea']}>
            <QuestionInput
              value={value}
              onChange={onChange}
              onSubmit={() => onSubmit(chatId!)}
              isLoading={isLoading}
              onStop={handleStop}
            />
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
            onSelect={memberId => {
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

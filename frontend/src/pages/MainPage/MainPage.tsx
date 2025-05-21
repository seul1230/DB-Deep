// src/pages/MainPage/MainPage.tsx
import React, { useState } from 'react';
import styles from './MainPage.module.css';
import QuestionInput from '@/shared/ui/QuestionInput/QuestionInput';
import RecommendedList from '@/entities/chat/RecommendedList/RecommendedList';
import { createChatRoom } from '@/features/chat/chatApi';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, resetInitialConnectionState, sendInitialConnection, sendMessage } from '@/shared/api/socketManager';
import { useAuth } from '@/features/auth/useAuth';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';

const recommendedQuestions = [
  '마케팅 캠페인 전후의 전환율 차이를 알려줘',
  '부서별 사용자 수 알려줘.',
  '이번 달 신규 유입 트렌드를 요약해줘',
  '사용자 이탈률이 높은 구간을 찾아줘',
  '오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘.',
];

const MainPage: React.FC = () => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { setMessages } = useChatMessageStore();

  const department = profile?.teamName ?? '알 수 없음';

  const createAndAsk = async (text: string) => {
    const question = text.trim();
    if (!question) return;

    try {
      // 1) 채팅방 생성
      const chatId = await createChatRoom();

      // 2) 미리 메시지 상태 세팅
      setMessages(chatId, [
        {
          id: `${Date.now()}-user`,
          uuid: chatId,
          parts: [{ type: 'text', content: question }],
          senderType: 'user',
          isLive: false,
        },
        {
          id: `${Date.now()}-ai`,
          uuid: chatId,
          parts: [{ type: 'status', content: '응답 생성 중...' }],
          senderType: 'ai',
          isLive: true,
        },
      ]);

      await connectSocket();
      resetInitialConnectionState();
      sendInitialConnection(chatId, department);
      sendMessage({ question });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      navigate(`/chat/${chatId}`);

    } catch {
      alert('채팅방 생성 또는 메시지 전송에 실패했습니다.');
    }
  };

  const handleSubmit = () => createAndAsk(input);

  const handleQuestionSelect = (text: string) => {
    // '+' 클릭 시 추천질문으로 바로 채팅 실행
    createAndAsk(text);
  };

  return (
    <div className={styles['MainPage-container']}>
      <h1 className={styles['MainPage-title']}>무엇을 도와드릴까요?</h1>
      <QuestionInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
      />
      <RecommendedList
        questions={recommendedQuestions}
        onSelect={handleQuestionSelect}
      />
    </div>
  );
};

export default MainPage;

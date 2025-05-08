import { useParams } from 'react-router-dom';
import { useRef, useState, Suspense, useCallback } from 'react';
import { ChatBubbleUser } from '@/entities/chat/ChatBubbleUser/ChatBubbleUser';
import { ChatBubbleDBDeep } from '@/entities/chat/ChatBubbleDBDeep/ChatBubbleDBDeep';
import { ChartCanvas } from '@/entities/chat/ChartCanvas/ChartCanvas';
import styles from './ChatDetailPage.module.css';
import QuestionInput from '@/shared/ui/QuestionInput/QuestionInput';
import Button from '@/shared/ui/Button/Button';
import TeamMemberSelectModal from '@/features/chat/TeamMemberSelectModal/TeamMemberSelectModal';

const ChatDetailPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [showChart, setShowChart] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const dummyChatList = [
    {
      id: 1,
      sender: 'user',
      text: '마케팅 캠페인 전환율 차이를 막대그래프로 그려줘.',
    },
    {
      id: 2,
      sender: 'dbdeep',
      text: `
## 🎯 20대 여성 타겟 마케팅 전략 제안

최근 카드사 데이터를 기반으로 20대 여성 고객들의 주요 소비 트렌드를 분석했습니다.

### 💡 주요 소비 업종

<Chart id="chart1" />
뷰티, 패션, 카페/디저트 업종에서 높은 소비 비율을 보이고 있으며, 특히 주말과 저녁 시간대의 소비가 집중되어 있습니다.

---

### 📊 월별 소비 트렌드 변화

<Chart id="chart2" />

1월부터 3월까지 뷰티/패션 업종에서 결제 건수가 지속적으로 증가하는 추세를 확인할 수 있습니다.

---

### 📌 마케팅 전략 제안

- **뷰티/패션 업종 제휴 할인 이벤트 기획**
- **주말 한정 포인트 적립 강화**
- **SNS 타겟 마케팅 캠페인 강화**
- **20대 여성 특화 멤버십 프로그램 출시 검토**
      `,
    },
  ];

  const dummyMembers = [
    {
      id: '1',
      name: '이승우',
      email: 'lsw@dbdeep.com',
      team: '데이터분석팀',
      avatarUrl: '/avatars/lsw.png',
    },
    {
      id: '2',
      name: '박경완',
      email: 'pkw@dbdeep.com',
      team: '데이터분석팀',
      avatarUrl: '/avatars/pkw.png',
    },
    // ... 추가
  ];
  

  const handleChartClick = (chartId: string) => {
    setSelectedChartId(chartId);
    setShowChart(true);
  };

  const scrollToBottom = useCallback(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const currentChatList = chatId && Number(chatId) === 1 ? dummyChatList : [];

  return (
    <div className={styles['chatDetailPage-outer']}>
      <div className={styles['chatDetailPage-scrollArea']} ref={chatBoxRef}>
        <div className={styles['chatDetailPage-chatBox']}>
          {currentChatList.length === 0 ? (
            <div className="text-center text-gray-500 text-xl mt-20">
              존재하지 않는 채팅입니다.
            </div>
          ) : (
            currentChatList.map((msg) =>
              msg.sender === 'user' ? (
                <ChatBubbleUser key={msg.id} text={msg.text} />
              ) : (
                <ChatBubbleDBDeep
                  key={msg.id}
                  text={msg.text}
                  onChartClick={handleChartClick}
                  onTyping={scrollToBottom}
                />
              )
            )
          )}
        </div>

        <Suspense>
          {showChart && selectedChartId && (
            <ChartCanvas chartId={selectedChartId} onClose={() => setShowChart(false)} />
          )}
        </Suspense>
      </div>

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

      {showModal && (
        <TeamMemberSelectModal
          members={dummyMembers}
          onClose={() => setShowModal(false)}
          onSelect={(memberId) => {
            alert(`팀원 ${memberId}에게 공유했습니다!`);
            setShowModal(false);
          }}
          onShare={(selectedMembers) => {
            console.log('공유할 멤버:', selectedMembers);
          }}
        />
      )}
    </div>
  );
};

export default ChatDetailPage;

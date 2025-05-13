import React, { useState } from "react";
import styles from "./MainPage.module.css";
import QuestionInput from "@/shared/ui/QuestionInput/QuestionInput";
import RecommendedList from "@/entities/chat/RecommendedList/RecommendedList";
import { createChatRoom } from "@/features/chat/chatApi";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/shared/api/socketManager";

const recommendedQuestions = [
  "마케팅 캠페인 전후의 전환율 차이를 알려줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘.",
  "이번 달 신규 유입 트렌드를 요약해줘",
  "사용자 이탈률이 높은 구간을 찾아줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘. 그리고 너무 길면 어떻게 되는지?ㅋㅋㅋㅋㅋㅋ...",
];

const MainPage: React.FC = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    try {
      const chatId = await createChatRoom();

      // 👉 WebSocket으로 메시지 전송
      sendMessage({
        uuid: chatId,
        question: text,
        department: "마케팅팀", // 사용자의 부서 (하드코딩 or user 상태에서 가져오기)
      });

      // ✅ 캐시 갱신 및 이동
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      navigate(`/chat/${chatId}`);
      setInput("");
    } catch {
      alert("채팅방 생성 실패");
    }
  };

  //추천 받은 질문이 구현되면 사용용
  // const handleQuestionSelect = (question: string) => {
  //   createAndNavigateChatRoom (question);
  // };

  const handleQuestionSelect = (text: string) => {
    console.log("선택된 질문:", text);
  };

  return (
    <div className={styles["MainPage-container"]}>
      <h1 className={styles["MainPage-title"]}>무엇을 도와드릴까요?</h1>
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

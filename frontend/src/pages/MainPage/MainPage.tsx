import React, { useState } from "react";
import styles from "./MainPage.module.css";
import QuestionInput from "@/shared/ui/QuestionInput/QuestionInput";
import RecommendedList from "@/entities/chat/RecommendedList/RecommendedList";
import axios from "@/shared/api/axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";


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


  const createChatRoom = async (initialMessage: string) => {
    if (!initialMessage.trim()) return;
    try {
      const res = await axios.post("/chats", {});
      const chatRoomId = res.data.result.chatRoomId;

      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      navigate(`/chat/${chatRoomId}`, { state: { initialMessage } }); // state로 메시지 전달
    } catch (err) {
      console.error("채팅방 생성 실패", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  const handleSubmit = () => {
    createChatRoom(input);
    setInput("");
  };

  //추천 받은 질문이 구현되면 사용용
  // const handleQuestionSelect = (question: string) => {
  //   createChatRoom(question);
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

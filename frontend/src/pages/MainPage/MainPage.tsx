import React from "react";
import styles from "./MainPage.module.css";
import QuestionInput from "@/shared/ui/QuestionInput/QuestionInput";
import RecommendedList from "@/shared/ui/RecommendedList/RecommendedList";

const recommendedQuestions = [
  "마케팅 캠페인 전후의 전환율 차이를 알려줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘.",
  "이번 달 신규 유입 트렌드를 요약해줘",
  "사용자 이탈률이 높은 구간을 찾아줘",
  "오늘 오전 10시에 트래픽이 급격히 증가한 이유를 알려줘. 그리고 너무 길면 어떻게 되는지?ㅋㅋㅋㅋㅋㅋ...",
];

const MainPage: React.FC = () => {
  const handleQuestionSelect = (text: string) => {
    console.log("선택된 질문:", text);
  };

  return (
    <div className={styles["MainPage-container"]}>
      <h1 className={styles["MainPage-title"]}>무엇을 도와드릴까요?</h1>
      <QuestionInput onChange={(text) => console.log("입력 중:", text)} />
      <RecommendedList questions={recommendedQuestions} onSelect={handleQuestionSelect} />
    </div>
  );
};

export default MainPage;

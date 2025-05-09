import React, { useState } from "react";
import styles from "./SearchPage.module.css";
import SearchInput from "@/features/search/SearchInput/SearchInput";
import SearchTabs from "@/features/search/SearchTabs/SearchTabs";
import SearchCard from "@/entities/search/SearchCard/SearchCard";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";

const sampleResults = [
  {
    id: "1",
    title: "세그먼트 구매 패턴",
    date: "2025년 4월 23일 오후 4시 32분",
    description: "고객 세그먼트별 구매 패턴 분석 결과입니다.",
    tableData: ["프리미엄", "450,000", "월 2.3회", "전자기기"],
  },
  {
    id: "2",
    title: "마케팅 캠페인 전후의 구매율",
    date: "2025년 2월 11일 오전 9시 02분",
    chartData: [
      { label: "캠페인 전", value: 11 },
      { label: "캠페인 후", value: 15 },
    ],
  },
  {
    id: "3",
    title: "세그먼트 구매 패턴",
    date: "2025년 4월 23일 오후 4시 33분",
    description:
      "이번 마케팅 캠페인 전후의 전환율을 비교한 결과, 캠페인 이전에는 11.00%, 캠페인 이후는 15.00%로 확인되었습니다. 이는 약 4.00%p의 전환율 상승을 의미하며, 상대적으로 36% 이상의 개선 효과를 나타냅니다.",
  },
];

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("전체");
  const { isOpen, targetId, position, closeOverlay } = useCardOverlayStore();

  const filteredResults = sampleResults.filter(
    (result) =>
      result.title.includes(query) || result.description?.includes(query)
  );

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>검색</h1>
          <div className={styles.titleDivider}></div>
          <SearchInput value={query} onChange={setQuery} />
          <SearchTabs active={selectedTab} onSelect={setSelectedTab} />
        </div>

        <div className={styles.resultList}>
          {filteredResults.map((result) => (
            <SearchCard
              key={result.id}
              id={result.id}
              title={result.title}
              date={result.date}
              content={result.description}
              highlight={query}
              chartData={result.chartData}
              table={result.tableData ? {
                세그먼트: result.tableData[0],
                매출: result.tableData[1],
                구매빈도: result.tableData[2],
                주요상품: result.tableData[3],
              } : undefined}
              onClick={() => console.log("카드 클릭", result.id)}
            />
          ))}
        </div>

        {isOpen && targetId && (
          <CardOverlay
            position={position}
            targetId={targetId}
            onCopy={(id) => console.log("복사:", id)}
            onClose={closeOverlay}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
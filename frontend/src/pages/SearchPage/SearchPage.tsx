import React, { useState } from "react";
import styles from "./SearchPage.module.css";
import SearchInput from "@/entities/search/SearchInput/SearchInput";
// import SearchTabs from "@/entities/search/SearchTabs/SearchTabs";
import SearchCard from "@/entities/search/SearchCard/SearchCard";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";
import { useMutation } from "@tanstack/react-query";
import { searchChats } from "@/features/search/searchApi";
import { SearchChatResult } from "@/features/search/searchTypes";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "@/shared/toast";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchChatResult[]>([]);
  // const [selectedTab, setSelectedTab] = useState("전체");
  const { isOpen, targetId, position, closeOverlay } = useCardOverlayStore();
  const navigate = useNavigate(); 

  const { mutate } = useMutation({
    mutationFn: searchChats,
    onSuccess: (data) => {
      setResults(data.result);
    },
    onError: (error) => {
      console.error("❌ 검색 실패:", error);
    },
  });
  
  const handleCopy = (id: string) => {
    const result = results.find((r) => r.chatId === id);
    const textToCopy = result?.message.insight || result?.message.question;
  
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showSuccessToast("클립보드에 복사되었습니다.");
      }).catch(() => {
        showErrorToast("복사 실패");
      });
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>검색</h1>
          <div className={styles.titleDivider}></div>
          <SearchInput value={query} onChange={setQuery} onSubmit={() => mutate(query)} />
          {/* <SearchTabs active={selectedTab} onSelect={setSelectedTab} /> */}
        </div>

        <div className={styles.resultList}>
          {results.map((result) => {
            const chart = result.message.chart;
            const chartData =
              chart && Array.isArray(chart.x) && Array.isArray(chart.y)
                ? chart.x.map((label: string, i: number) => ({
                    label,
                    value: chart.y?.[i] ?? 0,
                  }))
                : undefined;

            return (
              <SearchCard
                key={result.chatId}
                id={result.chatId}
                title={result.title}
                date={new Date(result.updatedAt).toLocaleString()}
                content={result.message.insight || result.message.question}
                highlight={query}
                chartData={chartData}
                onClick={() => navigate(`/chat/${result.chatId}`)}
              />
            );
          })}
        </div>

        {isOpen && targetId && (
          <CardOverlay
            position={position}
            targetId={targetId}
            onCopy={handleCopy}
            onClose={closeOverlay}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;

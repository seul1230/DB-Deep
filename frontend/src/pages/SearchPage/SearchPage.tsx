// SearchPage.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styles from "./SearchPage.module.css";
import SearchInput from "@/entities/search/SearchInput/SearchInput";
import SearchCard from "@/entities/search/SearchCard/SearchCard";
import ChartOverlay from "@/entities/chat/ChartOverlay/ChartOverlay";
import SectionTitle from "@/entities/archive/SectionTitle/SectionTitle";
import { searchChats } from "@/features/search/searchApi";
import { SearchChatResult } from "@/features/search/searchTypes";
import { CustomChartData } from "@/types/chart";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchChatResult[]>([]);
  const [selectedChart, setSelectedChart] = useState<CustomChartData | null>(null);
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: searchChats,
    onSuccess: (data) => {
      setResults(data.result);
    },
    onError: () => {
      // console.error("검색 실패", err);
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    mutate(query);
  };

  return (
    <div className={styles.searchPage_container}>
      <div className={styles.searchPage_inner}>
        <SectionTitle text="검색 결과" />
        <SearchInput value={query} onChange={setQuery} onSubmit={handleSearch} />

        <div className={styles.searchPage_cardList}>
          {isPending ? (
            <div className={styles.searchPage_loading}>검색 중...</div>
          ) : results.length === 0 ? (
            <div className={styles.searchPage_empty}>검색 결과가 없습니다.</div>
          ) : (
            results.map((result) => (
              <SearchCard
                key={result.chatId}
                chat={result}
                onClick={() => navigate(`/chat/${result.chatId}`)}
                onChartClick={setSelectedChart}
              />
            ))
          )}
        </div>
      </div>

      {selectedChart && (
        <ChartOverlay chartData={selectedChart} onClose={() => setSelectedChart(null)} />
      )}
    </div>
  );
};

export default SearchPage;

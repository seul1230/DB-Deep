// SearchCard.tsx
import React from "react";
import styles from "./SearchCard.module.css";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import { useSearchOverlayStore } from "@/shared/store/useSearchOverlayStore";
import SearchOverlay from "@/widgets/SearchOverlay/SearchOverlay";

interface Props {
  title: string;
  date: string;
  content?: string;
  highlight?: string;
  chartData?: { label: string; value: number }[];
  table?: Record<string, string>;
  onClick?: () => void;
}

const highlightText = (text: string, keyword?: string) => {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span key={i} className={styles.highlight}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const SearchCard: React.FC<Props> = ({ title, date, content, highlight, chartData, table, onClick }) => {
  const toggleOverlay = useSearchOverlayStore((s) => s.toggleOverlayForTarget);

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.meta}>
        <FiMessageSquare className={styles.icon} />
        <div className={styles.titleRow}>
          <div className={styles.cardTitle}>{highlightText(title, highlight)}</div>
          <div className={styles.date}>{date}</div>
        </div>
        <FiMoreVertical
          className={styles.moreIcon}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
            toggleOverlay({ top: rect.bottom + 4, left: rect.left }, title); // title을 ID처럼 사용
          }}
        />
      </div>

      {content && <div className={styles.description}>{highlightText(content, highlight)}</div>}

      {table && (
        <table className={styles.table}>
          <thead>
            <tr>{Object.keys(table).map((key, i) => <th key={i}>{key}</th>)}</tr>
          </thead>
          <tbody>
            <tr>{Object.values(table).map((val, i) => <td key={i}>{val}</td>)}</tr>
          </tbody>
        </table>
      )}

      {chartData && (
        <div className={styles.chartPreview}>
          {chartData.map((d, i) => (
            <div className={styles.chartBar} key={i}>
              <div className={styles.chartValue} style={{ height: `${d.value * 4}px` }} />
              <div className={styles.chartLabel}>{d.label}</div>
            </div>
          ))}
        </div>
      )}
      <SearchOverlay />
    </div>
  );
};

export default SearchCard;

import React, { useRef } from "react";
import styles from "./SearchCard.module.css";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";

interface Props {
  id: string;
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

const SearchCard: React.FC<Props> = ({ id, title, date, content, highlight, chartData, table, onClick }) => {
  const { toggleOverlayForTarget, isOpen, targetId, position, closeOverlay } = useCardOverlayStore();
  const moreRef = useRef<HTMLDivElement>(null);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = moreRef.current?.getBoundingClientRect();
    if (!rect) return;

    toggleOverlayForTarget(
      {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      },
      id
    );
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.meta}>
        <FiMessageSquare className={styles.icon} />
        <div className={styles.titleRow}>
          <div className={styles.cardTitle}>{highlightText(title, highlight)}</div>
          <div className={styles.date}>{date}</div>
        </div>
        <div ref={moreRef}>
          <FiMoreVertical className={styles.moreIcon} onClick={handleMoreClick} />
        </div>
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
    </div>
  );
};

export default SearchCard;

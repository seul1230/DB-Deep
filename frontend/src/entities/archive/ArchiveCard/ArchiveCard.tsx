import React, { useRef } from "react";
import styles from "./ArchiveCard.module.css";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import CardOverlay from "@/shared/ui/CardOverlay/CardOverlay";
import { useCardOverlayStore } from "@/shared/store/useCardOverlayStore";
import { deleteArchive } from "@/features/archive/archiveApi";

interface Props {
  id: string;
  title: string;
  date: string;
  description?: string;
  tableData?: string[][];
  chartData?: { label: string; value: number }[];
  onClick?: () => void;
  onDeleteSuccess?: (id: string) => void;
}

const ArchiveCard: React.FC<Props> = ({ id, title, date, description, tableData, chartData, onClick, onDeleteSuccess }) => {
  const moreIconRef = useRef<HTMLDivElement>(null);
  const { toggleOverlayForTarget, isOpen, targetId, position, closeOverlay } = useCardOverlayStore();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = moreIconRef.current?.getBoundingClientRect();
    if (rect) {
      toggleOverlayForTarget(
        { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX + 8 },
        id
      );
    }
  };

  const handleDelete = async (archiveId: string) => {
    try {
      await deleteArchive(archiveId);
      onDeleteSuccess?.(archiveId); // 페이지에서 전달된 콜백 호출
    } catch (e) {
      console.error("삭제 실패:", e);
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.meta}>
        <div className={styles.metaInner}>
          <FiMessageSquare className={styles.icon} />
          <div className={styles.centerArea}>
            <div className={styles.title}>{title}</div>
            <div className={styles.date}>{date}</div>
          </div>
          <div
            className={styles.moreIcon}
            onClick={handleMoreClick}
            ref={moreIconRef}
          >
            <FiMoreVertical />
          </div>
        </div>
      </div>

      {description && <div className={styles.description}>{description}</div>}

      {tableData && (
        <div className={styles.contentAligned}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>세그먼트</th>
                <th>평균구매액</th>
                <th>구매빈도</th>
                <th>선호카테고리</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chartData && (
        <div className={styles.chartPreview}>
          {chartData.map((d, i) => (
            <div className={styles.chartBar} key={i}>
              <div
                className={styles.chartValue}
                style={{ height: `${d.value * 4}px` }}
              />
              <div className={styles.chartLabel}>{d.label}</div>
            </div>
          ))}
        </div>
      )}

      {isOpen && targetId === id && (
        <CardOverlay
          position={position}
          targetId={id}
          onCopy={(id) => console.log("복사:", id)}
          onDelete={handleDelete}
          showDelete
          onClose={closeOverlay}
        />
      )}
    </div>
  );
};

export default ArchiveCard;
import React from "react";
import styles from "./ArchiveCard.module.css";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";

interface Props {
  title: string;
  date: string;
  description?: string;
  tableData?: string[][];
  chartData?: { label: string; value: number }[];
  onClick?: () => void; // 클릭 이벤트 추가
}

const ArchiveCard: React.FC<Props> = ({
  title,
  date,
  description,
  tableData,
  chartData,
  onClick,
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.meta}>
        <div className={styles.metaInner}>
          <FiMessageSquare className={styles.icon} />
          <div className={styles.centerArea}>
            <div className={styles.title}>{title}</div>
            <div className={styles.date}>{date}</div>
          </div>
          <FiMoreVertical
            className={styles.moreIcon}
            onClick={(e) => {
              e.stopPropagation(); // 카드 클릭 이벤트 방지
              console.log("더보기 클릭");
            }}
          />
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
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
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
    </div>
  );
};

export default ArchiveCard;

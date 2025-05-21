import styles from './InlineTable.module.css';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface InlineTableProps {
  data: Record<string, unknown>[];
  previewCount?: number;
}

export const InlineTable = ({ data, previewCount = 3 }: InlineTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(data) || data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const isOverflowing = data.length > previewCount;
  const rowsToRender = isExpanded ? data : data.slice(0, previewCount);

  const handleToggle = () => setIsExpanded((prev) => !prev);

  return (
    <div className={styles['inlineTable-wrapper']}>

      <div className={styles['inlineTable-title']}>데이터 보기</div>
      
      <div
        className={styles['inlineTable-tableWrapper']}
        style={{
          maxHeight: isExpanded ? 'none' : `${rowsToRender.length * 40 + 40}px`,
        }}
      >
        <table className={styles['inlineTable-table']}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((row, i) => (
              <tr key={i}>
                {headers.map((h) => (
                  <td key={h}>{String(row[h])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {!isExpanded && isOverflowing && (
          <div className={styles['inlineTable-fade']} />
        )}
      </div>

      {isOverflowing && (
        <div className={styles['inlineTable-toggleWrapper']}>
          <button
            className={styles['inlineTable-toggleButton']}
            onClick={handleToggle}
          >
            {isExpanded ? (
              <>
                <FiChevronUp size={14} />
                감추기
              </>
            ) : (
              <>
                <FiChevronDown size={14} />
                더보기
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

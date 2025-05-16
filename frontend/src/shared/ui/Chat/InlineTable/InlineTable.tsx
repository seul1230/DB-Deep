import styles from './InlineTable.module.css';

interface InlineTableProps {
  data: Record<string, unknown>[];
}

export const InlineTable = ({ data }: InlineTableProps) => {
  if (!Array.isArray(data) || data.length === 0) return <div>데이터 없음</div>;

  const headers = Object.keys(data[0]);

  return (
    <div className={styles['inlineTable-wrapper']}>
      <table className={styles['inlineTable-table']}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h}>{String(row[h])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
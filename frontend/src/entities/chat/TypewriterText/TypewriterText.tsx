import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../../../pages/ChatDetailPage/ChatDetailPage.module.css';
import { Components } from 'react-markdown';

interface TypewriterTextProps {
  markdownText: string;
  onChartClick: (chartId: string) => void;
  onTyping?: () => void;
}

export const TypewriterText = ({ markdownText, onChartClick, onTyping }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const speed = 20; // 타자 속도
    const interval = setInterval(() => {
      if (i < markdownText.length) {
        setDisplayedText((prev) => {
          const next = prev + markdownText.charAt(i);
          onTyping?.();
          return next;
        });        
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [markdownText, onTyping]);

  const renderers: Components = {
    p: (props) => <p className={styles['chatDetailPage-paragraph']}>{props.children}</p>,
    h2: (props) => <h2 className={styles['chatDetailPage-heading']}>{props.children}</h2>,
    hr: () => <hr className={styles['chatDetailPage-hr']} />,
    html: ({ node }) => {
      if (node && 'value' in node) {
        const htmlNode = node as { value?: string };
        const value = htmlNode.value;
        const chartMatch = value?.match(/<Chart id="(.*?)" \/>/);
        if (chartMatch) {
          return (
            <div
              className={styles['chatDetailPage-chartPlaceholder']}
              onClick={() => onChartClick(chartMatch[1])}
            >
              📊 차트 보러가기 (ID: {chartMatch[1]})
            </div>
          );
        }
      }
      return null;
    },
  };

  return (
    <div className={styles['chatDetailPage-typewriter']}>
      <ReactMarkdown components={renderers}>{displayedText}</ReactMarkdown>
    </div>
  );
};
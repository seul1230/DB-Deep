import { useEffect, useRef, useState, useMemo } from 'react';
import styles from './TypewriterText.module.css';
import ReactMarkdown from 'react-markdown';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';

interface Props {
  chatId: string;
}

export const TypewriterText = ({ chatId }: Props) => {
  const { insightQueue, messages } = useChatMessageStore();
  const insightLines = useMemo(() => insightQueue[chatId] || [], [insightQueue, chatId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [bufferQueue, setBufferQueue] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const isLive = (() => {
    const list = messages[chatId] || [];
    const last = list[list.length - 1];
    return last?.isLive && last?.type !== 'follow_up_stream';
  })();

  // 새 줄이 들어오면 bufferQueue에 추가
  useEffect(() => {
    if (!isLive) return;
    setBufferQueue((prev) => {
      if (currentLine !== '') return prev;
      const alreadyBuffered = prev.length + (currentLine ? 1 : 0);
      const unseen = insightLines.slice(alreadyBuffered);
      return [...prev, ...unseen];
    });
  }, [insightLines, isLive, currentLine]);

  // 타자 효과
  useEffect(() => {
    if (!isLive) return;

    if (!currentLine && bufferQueue.length > 0) {
      const [nextLine, ...rest] = bufferQueue;
      setCurrentLine(nextLine);
      setBufferQueue(rest);
      setCharIndex(0);
      return;
    }

    if (currentLine && charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentLine[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timeout);
    }

    if (currentLine && charIndex === currentLine.length) {
      setDisplayedText((prev) => prev + currentLine);
      setCurrentLine('');
      setCharIndex(0);
      if (bufferQueue.length === 0) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  }, [isLive, currentLine, charIndex, bufferQueue]);

  // 스크롤 동기화
  useEffect(() => {
    if (!isLive) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [displayedText, isLive]);

  // 새 메시지 도착 시 초기화
  useEffect(() => {
    if (!isLive) return;
    setDisplayedText('');
    setBufferQueue([]);
    setCurrentLine('');
    setCharIndex(0);
  }, [isLive]);

  return (
    <div className={styles['typewriterText-wrapper']}>
      <ReactMarkdown
        components={{
          p: (props) => <p style={{ marginBottom: '0.25rem' }} {...props} />,
        }}
        skipHtml
      >
        {displayedText}
      </ReactMarkdown>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

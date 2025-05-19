import { useEffect, useRef, useState } from 'react';
import styles from './TypewriterText.module.css';
import ReactMarkdown from 'react-markdown';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';

interface Props {
  chatId: string;
}

export const TypewriterText = ({ chatId }: Props) => {
  const { insightQueue, messages } = useChatMessageStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [bufferQueue, setBufferQueue] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const isLive = (() => {
    const list = messages[chatId] || [];
    return list.length > 0 && list[list.length - 1].isLive;
  })();

  // 1. insightQueue가 바뀔 때마다 내부 큐에 복사
  useEffect(() => {
    if (!isLive) return;

    const newLines = insightQueue[chatId] || [];
    const unseenLines = newLines.slice(bufferQueue.length);
    if (unseenLines.length > 0) {
      setBufferQueue(prev => [...prev, ...unseenLines]);
    }
  }, [insightQueue, chatId, isLive, bufferQueue.length]);

  // 2. 타자 효과 (줄 → 글자 단위)
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
        setDisplayedText(prev => prev + currentLine[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 60); // 타자 속도

      return () => clearTimeout(timeout);
    }

    if (currentLine && charIndex === currentLine.length) {
      setDisplayedText(prev => prev + '\n');
      setCurrentLine('');
    }
  }, [isLive, currentLine, charIndex, bufferQueue]);

  // 3. 자동 스크롤
  useEffect(() => {
    if (!isLive) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [displayedText, isLive]);

  // 4. 새 메시지 시작 시 초기화
  useEffect(() => {
    if (!isLive) return;
    setDisplayedText('');
    setBufferQueue([]);
    setCurrentLine('');
    setCharIndex(0);
  }, [isLive]);

  return (
    <div className={styles['typewriterText-wrapper']}>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

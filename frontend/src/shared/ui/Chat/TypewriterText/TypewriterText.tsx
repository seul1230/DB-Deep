import { useEffect, useRef, useState, useMemo } from 'react';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import styles from './TypewriterText.module.css';
import ReactMarkdown from 'react-markdown';

interface Props {
  chatId: string;
}

export const TypewriterText = ({ chatId }: Props) => {
  const { insightQueue } = useChatMessageStore();
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // ✅ 전체 인사이트 문자열 생성 (빈 배열 방어 포함)
  const fullText = useMemo(() => {
    const lines = insightQueue[chatId];
    return Array.isArray(lines) ? lines.join('') : '';
  }, [insightQueue, chatId]);

  // ✅ 한 글자씩 타자 효과
  useEffect(() => {
    if (!fullText || charIndex >= fullText.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + fullText[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 25);

    return () => clearTimeout(timeout);
  }, [charIndex, fullText]);

  // ✅ 자동 스크롤
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedText]);

  return (
    <div className={styles['typewriterText-wrapper']}>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      <div ref={scrollAnchorRef} />
    </div>
  );
};

import { useEffect, useRef, useState, useMemo } from 'react';
import styles from './TypewriterText.module.css';
import ReactMarkdown from 'react-markdown';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';

interface Props {
  chatId: string;
}

export const TypewriterText = ({ chatId }: Props) => {
  const { insightText, messages } = useChatMessageStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fullText = useMemo(() => insightText[chatId] || '', [insightText, chatId]);

  const [typed, setTyped] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const isLive = useMemo(() => {
    const list = messages[chatId] || [];
    const last = list[list.length - 1];
    return last?.isLive;
  }, [messages, chatId]);

  useEffect(() => {
    if (!isLive || charIndex >= fullText.length) return;

    const timeout = setTimeout(() => {
      setTyped((prev) => prev + fullText[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 20);

    return () => clearTimeout(timeout);
  }, [charIndex, fullText, isLive]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [typed]);

  // ✅ 메시지 새로 시작될 때 초기화
  useEffect(() => {
    setTyped('');
    setCharIndex(0);
  }, [chatId]);

  return (
    <div className={styles['typewriterText-wrapper']}>
      <ReactMarkdown>{typed}</ReactMarkdown>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

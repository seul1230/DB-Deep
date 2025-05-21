// src/shared/ui/Chat/TypewriterText/TypewriterText.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import { ChatMarkdownRenderers } from '@/shared/ui/Chat/ChatBubbleDBDeep/markdownRenderers';
import styles from './TypewriterText.module.css';

interface Props {
  chatId: string;
  messageId: string;
}

export const TypewriterText: React.FC<Props> = ({ chatId, messageId }) => {
  const { insightText, messages, setInsightText } = useChatMessageStore();
  const fullText = insightText[messageId] || '';
  const [typed, setTyped] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  // 마지막 메시지의 live 상태
  const isLive = useMemo(() => {
    const list = messages[chatId] || [];
    const msg = list.find(m => m.id === messageId);
    return msg?.isLive ?? false;
  }, [messages, chatId, messageId]);

  // live→false 전환 시에만 타자 인덱스 초기화
  const prevLive = useRef(isLive);
  useEffect(() => {
    if (prevLive.current && !isLive) {
      setTyped('');
      setCharIndex(0);
    }
    prevLive.current = isLive;
  }, [isLive]);

  // 한 글자씩 타이핑
  useEffect(() => {
    if (isLive || charIndex >= fullText.length) return;
    const tm = setTimeout(() => {
      setTyped((p) => p + fullText[charIndex]);
      setCharIndex((i) => i + 1);
    }, 40);
    return () => clearTimeout(tm);
  }, [charIndex, fullText, isLive]);

  // 타이핑 완료 직후 텍스트 초기화(다음 렌더링 때 Markdown 렌더)
  useEffect(() => {
    if (!isLive && charIndex >= fullText.length && fullText) {
      setInsightText(chatId, () => '');
    }
  }, [isLive, charIndex, fullText, chatId, setInsightText]);

  // 타이핑할 때마다 내부만큼은 스크롤
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [typed]);

  return (
    <div className={styles['typewriterText-wrapper']}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={ChatMarkdownRenderers(() => {})}
      >
        {typed}
      </ReactMarkdown>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

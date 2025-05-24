import React, { useEffect, useRef, useState  } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import { ChatMarkdownRenderers } from '@/shared/ui/Chat/ChatBubbleDBDeep/markdownRenderers';
import styles from './TypewriterText.module.css';

interface Props {
  chatId: string;
  messageId: string;
}

export const TypewriterText: React.FC<Props> = ({ messageId }) => {
  const {
    insightText,
    setInsightText,
    canType,
    setCanType,
  } = useChatMessageStore();

  const fullText = insightText[messageId] || '';
  const canTypewrite = canType[messageId];

  const [typed, setTyped] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // 타이핑 조건: canTypewrite === true 일 때 시작
  useEffect(() => {
    if (canTypewrite && !hasStartedTyping && fullText.length > 0) {
      setTyped('');
      setCharIndex(0);
      setHasStartedTyping(true);
    }
  }, [canTypewrite, fullText, hasStartedTyping]);

  // 실제 타자 효과 실행
  useEffect(() => {
    if (!canTypewrite || charIndex >= fullText.length) return;
    const tm = setTimeout(() => {
      setTyped((prev) => prev + fullText[charIndex]);
      setCharIndex((i) => i + 1);
    }, 20);
    return () => clearTimeout(tm);
  }, [charIndex, fullText, canTypewrite]);

  // 타이핑 완료 시 상태 초기화 (다음 메시지 대비)
  useEffect(() => {
    if (charIndex >= fullText.length && fullText) {
      setInsightText(messageId, () => '');
      setCanType(messageId, false);
      setHasStartedTyping(false);
    }
  }, [charIndex, fullText, messageId, setInsightText, setCanType]);

  // 스크롤 유지
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

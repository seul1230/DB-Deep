import { useState, useRef, useEffect } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiMoreVertical } from 'react-icons/fi';
import { ChatBubbleMenuOverlay } from '@/entities/chat/ChatBubbleMenuOverlay/ChatBubbleMenuOverlay';
import { InlineChart } from '../InlineChart/InlineChart';
import { Components } from 'react-markdown';

interface ChatBubbleDBDeepProps {
  text: string;
  onChartClick: (chartId: string) => void;
  onTyping?: () => void;
  isLive?: boolean;
}

export const ChatBubbleDBDeep = ({
  text,
  onChartClick,
  onTyping,
  isLive = false,
}: ChatBubbleDBDeepProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markdownComponents: Components = {
    p: (props) => {
      const content = String(props.children);
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        return <InlineChart chartJson={content} />;
      }
      return <p>{props.children}</p>;
    },
    code: () => <></>, // 숨김 처리
  };

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']}>
      <div className={styles['chatBubbleDBDeep-bubbleWithMenu']}>
        <div className={styles['chatBubbleDBDeep-bubble']}>
          {isLive ? (
            <TypewriterText markdownText={text} onChartClick={onChartClick} onTyping={onTyping} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {text}
            </ReactMarkdown>
          )}
        </div>

        <div className={styles['chatBubbleDBDeep-menuArea']} ref={menuRef}>
          <button
            className={styles['chatBubbleDBDeep-menuButton']}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <FiMoreVertical size={18} />
          </button>
          {menuOpen && (
            <ChatBubbleMenuOverlay
              onCopy={() => navigator.clipboard.writeText(text)}
              onArchive={() => alert('아카이브에 저장했습니다. (API 연동 예정)')}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

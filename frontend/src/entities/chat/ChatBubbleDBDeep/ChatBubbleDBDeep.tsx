import { useState, useRef, useEffect } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';
import { FiMoreVertical } from 'react-icons/fi';
import { ChatBubbleMenuOverlay } from '../ChatBubbleMenuOverlay/ChatBubbleMenuOverlay';

interface ChatBubbleDBDeepProps {
  text: string;
  onChartClick: (chartId: string) => void;
  onTyping?: () => void;
}

export const ChatBubbleDBDeep = ({ text, onChartClick, onTyping }: ChatBubbleDBDeepProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert('채팅이 복사되었습니다.');
  };

  const handleArchive = () => {
    alert('아카이브에 저장했습니다. (API 연동 예정)');
  };

  // ✅ 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']}>
      <div className={styles['chatBubbleDBDeep-bubbleWithMenu']}>
        <div className={styles['chatBubbleDBDeep-bubble']}>
          <TypewriterText
            markdownText={text}
            onChartClick={onChartClick}
            onTyping={onTyping}
          />
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
              onCopy={handleCopy}
              onArchive={handleArchive}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';

interface ChatBubbleDBDeepProps {
  text: string;
  onChartClick: (chartId: string) => void;
}

export const ChatBubbleDBDeep = ({ text, onChartClick }: ChatBubbleDBDeepProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert('채팅이 복사되었습니다.');
    setMenuOpen(false);
  };

  const handleArchive = () => {
    alert('아카이브에 저장했습니다. (API 연동 예정)');
    setMenuOpen(false);
  };

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']}>
      <div className={styles['chatBubbleDBDeep-header']}>
        <button
          className={styles['chatBubbleDBDeep-menuButton']}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div className={styles['chatBubbleDBDeep-menu']}>
            <button onClick={handleCopy}>채팅 복사</button>
            <button onClick={handleArchive}>아카이브 저장</button>
          </div>
        )}
      </div>
      <div className={styles['chatBubbleDBDeep-bubble']}>
        <TypewriterText markdownText={text} onChartClick={onChartClick} />
      </div>
    </div>
  );
};

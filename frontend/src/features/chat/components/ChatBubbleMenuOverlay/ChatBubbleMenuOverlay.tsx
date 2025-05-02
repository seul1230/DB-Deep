import { useEffect, useRef } from 'react';
import styles from './ChatBubbleMenuOverlay.module.css';
import { FiCopy } from 'react-icons/fi';
import { LuBookmarkMinus } from 'react-icons/lu';

interface ChatBubbleMenuOverlayProps {
  onCopy: () => void;
  onArchive: () => void;
  onClose: () => void;
}

export const ChatBubbleMenuOverlay = ({ onCopy, onArchive, onClose }: ChatBubbleMenuOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles['chatBubbleMenuOverlay']} ref={overlayRef}>
      <button onClick={() => { onCopy(); onClose(); }}>
        <FiCopy size={16} style={{ marginRight: '8px', color: 'var(--icon-blue)' }} />
        채팅 복사
      </button>
      <button onClick={() => { onArchive(); onClose(); }}>
        <LuBookmarkMinus size={16} style={{ marginRight: '8px', color: 'var(--icon-blue)' }} />
        아카이브 저장
      </button>
    </div>
  );
};

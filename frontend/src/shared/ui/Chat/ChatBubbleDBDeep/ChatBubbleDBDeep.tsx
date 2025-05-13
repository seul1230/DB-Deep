import { useState, useRef, useEffect } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiMoreVertical } from 'react-icons/fi';
import { ChatBubbleMenuOverlay } from '@/entities/chat/ChatBubbleMenuOverlay/ChatBubbleMenuOverlay';
import { InlineChart } from '../InlineChart/InlineChart';
import { Components } from 'react-markdown';
import { showSuccessToast, showErrorToast } from '@/shared/toast';
import { archiveChatMessage } from '@/features/archive/archiveApi';

interface ChatBubbleDBDeepProps {
  text: string;
  onChartClick: (chartId: string) => void;
  onTyping?: () => void;
  isLive?: boolean;
  showMenu?: boolean;
  uuid: string;
  messageId: number;
}

export const ChatBubbleDBDeep = ({
  text,
  onChartClick,
  onTyping,
  isLive = false,
  showMenu = true,
  uuid,
  messageId,
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

        {showMenu && ( 
          <div className={styles['chatBubbleDBDeep-menuArea']} ref={menuRef}>
            <div className={styles['chatBubbleDBDeep-menuButtonWrapper']}>
              <button
                className={styles['chatBubbleDBDeep-menuButton']}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <FiMoreVertical size={18} />
              </button>
              {menuOpen && (
                <div className={styles['chatBubbleDBDeep-menuOverlayContainer']}>
                  <ChatBubbleMenuOverlay
                    onCopy={() => {
                      navigator.clipboard.writeText(text);
                      showSuccessToast('채팅이 복사되었습니다.');
                    }}
                    onArchive={async () => {
                      try {
                        const archiveId = parseInt(uuid, 10); // 백엔드에서 요구하는 타입이 number라고 가정
                        await archiveChatMessage({ archiveId, messageId });
                        showSuccessToast('채팅이 아카이브에 저장되었습니다.');
                      } catch (error) {
                        showErrorToast('아카이브 저장에 실패했습니다.');
                        console.error(error);
                      }
                    }}
                    onClose={() => setMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

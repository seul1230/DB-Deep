import { useState, useRef, useEffect } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';
import { ChatPart } from '@/features/chat/chatTypes';
import { FiMoreVertical } from 'react-icons/fi';
import { ChatBubbleMenuOverlay } from '@/entities/chat/ChatBubbleMenuOverlay/ChatBubbleMenuOverlay';
import { InlineChart } from '../InlineChart/InlineChart';
import { showSuccessToast, showErrorToast } from '@/shared/toast';
import { archiveChatMessage } from '@/features/archive/archiveApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMarkdownRenderers } from './markdownRenderers';

interface Props {
  parts: ChatPart[];
  isLive: boolean;
  uuid: string;
  messageId: string;
  onChartClick: (chartId: string) => void;
}

export const ChatBubbleDBDeep = ({
  parts,
  isLive,
  messageId,
  onChartClick,
}: Props) => {
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

  const text = parts.filter(p => p.type === 'text').map(p => p.content).join('\n');
  const sql = parts.find(p => p.type === 'sql')?.content;
  const status = parts.find(p => p.type === 'status')?.content;
  const chart = parts.find(p => p.type === 'chart')?.content;

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']}>
      <div className={styles['chatBubbleDBDeep-bubbleWithMenu']}>
        <div className={styles['chatBubbleDBDeep-bubble']}>
          {isLive ? (
            <TypewriterText markdownText={text} onChartClick={onChartClick} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={ChatMarkdownRenderers(onChartClick)}>
              {text}
            </ReactMarkdown>
          )}

          {sql && (
            <pre className={styles['chatBubbleDBDeep-sqlBlock']}>{sql}</pre>
          )}

          {chart && (
            <InlineChart chartJson={JSON.stringify(chart)} />
          )}

          {status && (
            <div className={styles['chatBubbleDBDeep-status']}>{status}</div>
          )}
        </div>

        <div className={styles['chatBubbleDBDeep-menuArea']} ref={menuRef}>
          <div className={styles['chatBubbleDBDeep-menuButtonWrapper']}>
            <button
              className={styles['chatBubbleDBDeep-menuButton']}
              onClick={() => setMenuOpen(prev => !prev)}
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
                    if (!messageId) {
                      console.log(messageId)
                      showErrorToast("이 메시지는 아카이브할 수 없습니다.");
                      return;
                    }

                    try {
                      await archiveChatMessage(messageId); // ✅ 단일 인자 전달
                      showSuccessToast("채팅이 아카이브에 저장되었습니다.");
                    } catch (err) {
                      console.error(err);
                      showErrorToast("아카이브 저장에 실패했습니다.");
                    }
                  }}
                  onClose={() => setMenuOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

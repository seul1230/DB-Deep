import { useEffect, useRef, useState } from 'react';
import styles from './ChatBubbleDBDeep.module.css';
import { TypewriterText } from '../TypewriterText/TypewriterText';
import { ChatPart } from '@/features/chat/chatTypes';
import { InlineQuery } from '../InlineQuery/InlineQuery';
import { InlineChart } from '../InlineChart/InlineChart';
import { InlineTable } from '../InlineTable/InlineTable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMarkdownRenderers } from './markdownRenderers';
import { FiMoreVertical } from 'react-icons/fi';
import { ChatBubbleMenuOverlay } from '@/entities/chat/ChatBubbleMenuOverlay/ChatBubbleMenuOverlay';
import { showErrorToast, showSuccessToast } from '@/shared/toast';
import { archiveChatMessage } from '@/features/archive/archiveApi';
import { useChatMessageStore } from '@/features/chat/useChatMessageStore';
import { CustomChartData } from '@/types/chart';
import clsx from 'clsx';
import { ChatSpinner } from '@/entities/chat/ChatSpinner/ChatSpinner';

interface Props {
  parts: ChatPart[];
  isLive: boolean;
  uuid: string;
  messageId: string;
  onChartClick: (chartData: CustomChartData) => void;
  showMenu?: boolean;
  noBackground?: boolean;
}

export const ChatBubbleDBDeep = ({
  parts,
  isLive,
  uuid,
  messageId,
  onChartClick,
  showMenu = true,
  noBackground = false,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getRealChatId } = useChatMessageStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [parts, isLive]);

  const textParts = parts.filter((p) => p.type === 'text');
  const sql = parts.find((p) => p.type === 'sql')?.content;
  const chart = parts.find((p) => p.type === 'chart')?.content;
  const data = parts.find((p) => p.type === 'data')?.content;
  const status = parts.find((p) => p.type === 'status')?.content;

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']} ref={scrollRef}>
      <div className={styles['chatBubbleDBDeep-bubbleWithMenu']}>
        <div
          className={clsx(
            styles['chatBubbleDBDeep-bubble'],
            noBackground && styles['chatBubbleDBDeep-bubbleNoBg']
          )}
          style={{ maxWidth: '100%', width: '100%' }}
        >
          {sql && (
            <div className={styles['chatBubbleDBDeep-section']}>
              <InlineQuery sql={sql} />
            </div>
          )}

          {data && (
            <div className={styles['chatBubbleDBDeep-section']}>
              <InlineTable data={data} />
            </div>
          )}

          {chart && (
            <InlineChart
              chartJson={JSON.stringify(chart)}
              onClick={(chartData) => onChartClick(chartData)}
            />
          )}

          {status && (
            <div className={styles['chatBubbleDBDeep-section']}>
              <ChatSpinner />
            </div>
          )}

          {isLive ? (
            <div className={styles['chatBubbleDBDeep-section']}>
              <TypewriterText chatId={uuid} />
            </div>
          ) : (
            textParts.map((part, idx) => (
              <div className={styles['chatBubbleDBDeep-section']} key={idx}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={ChatMarkdownRenderers(onChartClick)}
                >
                  {part.content}
                </ReactMarkdown>
              </div>
            ))
          )}

          {parts.map((part, idx) => {
            if (part.type === 'hr') {
              return (
                <hr
                  key={idx}
                  className={styles['chatBubbleDBDeep-bubble-hr']}
                />
              );
            }
            return null;
          })}
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
                      navigator.clipboard.writeText(
                        textParts.map((p) => p.content).join('\n')
                      );
                      showSuccessToast('채팅이 복사되었습니다.');
                    }}
                    onArchive={async () => {
                      const realChatId = getRealChatId(uuid);
                      const archiveIdToUse = realChatId || messageId;

                      if (!archiveIdToUse) {
                        showErrorToast('아카이브 저장에 필요한 ID를 찾을 수 없습니다.');
                        return;
                      }

                      try {
                        await archiveChatMessage(archiveIdToUse);
                        showSuccessToast('채팅이 아카이브에 저장되었습니다.');
                      } catch (err) {
                        console.error(err);
                        showErrorToast('아카이브 저장에 실패했습니다.');
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
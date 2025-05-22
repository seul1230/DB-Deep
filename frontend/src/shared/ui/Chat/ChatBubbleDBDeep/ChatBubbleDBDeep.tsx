// src/shared/ui/Chat/ChatBubbleDBDeep/ChatBubbleDBDeep.tsx
import React, { useEffect, useRef, useState } from 'react';
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

export const ChatBubbleDBDeep: React.FC<Props> = ({
  parts,
  isLive,
  uuid,
  messageId,
  onChartClick,
  showMenu = true,
  noBackground = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getRealChatId, insightText } = useChatMessageStore();
  const newInsight = insightText[messageId];
  const shouldTypewrite = isLive && !!newInsight;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const textParts = parts.filter((p) => p.type === 'text');
  const sql    = parts.find((p) => p.type === 'sql')?.content;
  const data   = parts.find((p) => p.type === 'data')?.content;
  const chart  = parts.find((p) => p.type === 'chart')?.content;
  const status = parts.find((p) => p.type === 'status')?.content;
  console.log('shouldTypewrite:', isLive, newInsight);

  return (
    <div className={styles['chatBubbleDBDeep-wrapper']}>
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
            <div className={styles['chatBubbleDBDeep-section']}>
              <InlineChart
                chartJson={JSON.stringify(chart)}
                onClick={onChartClick}
              />
            </div>
          )}
          {status && (
            <div className={styles['chatBubbleDBDeep-section']}>
              <ChatSpinner />
            </div>
          )}

          {/**
            * • newInsight가 있으면 → TypewriterText
            * • 없으면 → 기존 파트들 한 번만 Markdown 렌더링
            */}
          {shouldTypewrite ? (
            <div className={styles['chatBubbleDBDeep-section']}>
              <TypewriterText 
                chatId={uuid} 
                messageId={messageId} 
                key={`${messageId}-${newInsight?.slice(0, 10)}`}
              />
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

          {parts.map(
            (part, idx) =>
              part.type === 'hr' && (
                <hr
                  key={idx}
                  className={styles['chatBubbleDBDeep-bubble-hr']}
                />
              )
          )}
        </div>

        {showMenu && (
          <div
            className={styles['chatBubbleDBDeep-menuArea']}
            ref={menuRef}
          >
            <div
              className={styles['chatBubbleDBDeep-menuButtonWrapper']}
            >
              <button
                className={styles['chatBubbleDBDeep-menuButton']}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <FiMoreVertical size={18} />
              </button>
              {menuOpen && (
                <div
                  className={
                    styles['chatBubbleDBDeep-menuOverlayContainer']
                  }
                >
                  <ChatBubbleMenuOverlay
                    onCopy={() => {
                      navigator.clipboard.writeText(
                        textParts.map((p) => p.content).join('\n')
                      );
                      showSuccessToast('채팅이 복사되었습니다.');
                    }}
                    onArchive={async () => {
                      const realId =
                        getRealChatId(uuid) || messageId;
                      if (!realId) {
                        showErrorToast(
                          '아카이브 저장에 필요한 ID를 찾을 수 없습니다.'
                        );
                        return;
                      }
                      try {
                        await archiveChatMessage(realId);
                        showSuccessToast(
                          '채팅이 아카이브에 저장되었습니다.'
                        );
                      } catch {
                        showErrorToast(
                          '아카이브 저장에 실패했습니다.'
                        );
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

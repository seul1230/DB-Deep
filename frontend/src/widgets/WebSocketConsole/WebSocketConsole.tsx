import styles from './WebSocketConsole.module.css';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const renderConsoleJson = (raw: string) => {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    const { question, analysis_direction, sql_thinking_flow, need_chart, sql_code } = parsed;

    return (
      <div className={styles['webSocketConsole-consoleBlock']}>
        {question && <div><strong>Question:</strong> {question}</div>}
        {analysis_direction && <div><strong>Analysis Direction:</strong> {analysis_direction}</div>}
        {sql_thinking_flow && (
          <div>
            <strong>SQL Thinking Flow:</strong>
            <pre className={styles['webSocketConsole-pre']}>{sql_thinking_flow}</pre>
          </div>
        )}
        {typeof need_chart === 'boolean' && (
          <div>
            <strong>Need Chart:</strong>{' '}
            <span className={need_chart ? styles['boolean-true'] : styles['boolean-false']}>
              {need_chart ? 'true' : 'false'}
            </span>
          </div>
        )}
        {sql_code && (
          <div>
            <strong>SQL Code:</strong>
            <pre className={styles['webSocketConsole-pre']}>{sql_code}</pre>
          </div>
        )}
      </div>
    );
  } catch {
    return <div className={styles['webSocketConsole-consoleBlock']}>{raw}</div>;
  }
};

const WebSocketConsole = () => {
  const { logs, removeLog } = useWebSocketLogger();
  const { isOpen, toggleConsole, setConsoleOpen } = useWebSocketConsoleStore();
  const { chart } = useChartOverlayStore();
  const logEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isMainPage = location.pathname === '/main';

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (isMainPage && isOpen) {
      setConsoleOpen(false);
    }
  }, [isMainPage, isOpen, setConsoleOpen]);

  return (
    <>
      <div
        className={clsx(styles['webSocketConsole-container'], {
          [styles['webSocketConsole-open']]: isOpen,
        })}
      >
        <div className={styles['webSocketConsole-logWrapper']}>
          <AnimatePresence initial={false}>
            {logs.map((log, idx) => {
              if (log.type !== 'console') return null;
              return (
                <motion.div
                  key={`${log.message}-${idx}`}
                  className={styles['webSocketConsole-logLine']}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <span
                    className={styles['webSocketConsole-trashIcon']}
                    title="이 로그 삭제"
                    onClick={() => removeLog(idx)}
                  >
                    <FaTrash />
                  </span>
                  {renderConsoleJson(log.message)}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>
      </div>

      {!isMainPage && !chart && (
        <button
          className={clsx(styles['webSocketConsole-toggleButton'], {
            [styles['webSocketConsole-toggleOpen']]: isOpen,
          })}
          onClick={toggleConsole}
          title="WebSocket 콘솔 열기/닫기"
        >
          {isOpen ? '→' : '←'}
        </button>
      )}
    </>
  );
};

export default WebSocketConsole;

import styles from './WebSocketConsole.module.css';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

const renderConsoleJson = (raw: string) => {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');

    const parsed = JSON.parse(cleaned);
    const {
      question,
      analysis_direction,
      sql_thinking_flow,
      need_chart,
      sql_code,
    } = parsed;

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
  const { logs } = useWebSocketLogger();
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
          {logs
            .filter((log) => log.type === 'console')
            .map((log, idx) => (
              <div key={idx} className={styles['webSocketConsole-logLine']}>
                {renderConsoleJson(log.message)}
              </div>
            ))}
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

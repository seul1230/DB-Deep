import styles from './WebSocketConsole.module.css';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';

const WebSocketConsole = () => {
  const { logs } = useWebSocketLogger();
  const { isOpen, toggleConsole } = useWebSocketConsoleStore();
  const { chart } = useChartOverlayStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <>
      <div
        className={clsx(styles['webSocketConsole-container'], {
          [styles['webSocketConsole-open']]: isOpen,
        })}
      >
        <div className={styles['webSocketConsole-logWrapper']}>
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={clsx(
                styles['webSocketConsole-logLine'],
                styles[`webSocketConsole-${log.type}`]
              )}
            >
              [{log.type.toUpperCase()}] {log.message}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
      {/* ✅ 차트가 열려있으면 토글 버튼 숨김 */}
      {!chart && (
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

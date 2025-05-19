import styles from './WebSocketConsole.module.css';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

const WebSocketConsole = () => {
  const { logs } = useWebSocketLogger();
  const { isOpen, toggleConsole, setConsoleOpen } = useWebSocketConsoleStore();
  const { chart } = useChartOverlayStore();
  const logEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isMainPage = location.pathname === '/main';

  // ✅ 로그 자동 스크롤
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // ✅ /main에서는 콘솔 무조건 닫힘
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

      {/* ✅ 메인 페이지거나 차트 오버레이 열려 있으면 버튼 숨김 */}
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

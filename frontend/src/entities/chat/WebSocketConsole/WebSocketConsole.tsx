// src/entities/chat/WebSocketConsole/WebSocketConsole.tsx
import styles from './WebSocketConsole.module.css';
import { useWebSocketLogger } from '@/features/chat/useWebSocketLogger';
import { useWebSocketConsoleStore } from '@/features/chat/useWebSocketConsoleStore';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

const WebSocketConsole = () => {
  const { logs } = useWebSocketLogger();
  const { isOpen, toggleConsole } = useWebSocketConsoleStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div
      className={clsx(styles['webSocketConsole-container'], {
        [styles['webSocketConsole-open']]: isOpen,
      })}
    >
      <button
        className={styles['webSocketConsole-toggleButton']}
        onClick={toggleConsole}
        title="Toggle WebSocket Console"
      >
        {isOpen ? '→' : '←'}
      </button>
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
  );
};

export default WebSocketConsole;

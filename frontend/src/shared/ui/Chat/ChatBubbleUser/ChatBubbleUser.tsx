import styles from './ChatBubbleUser.module.css';
import { FaRedo } from 'react-icons/fa';

interface ChatBubbleUserProps {
  text: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

export const ChatBubbleUser = ({ text, showRetryButton = false, onRetry }: ChatBubbleUserProps) => {
  return (
    <div className={styles['chatBubbleUser-wrapper']}>
      <div className={styles['chatBubbleUser-bubble']}>{text}</div>
      {showRetryButton && onRetry && (
        <button
          className={styles['chatBubbleUser-retryButton']}
          onClick={onRetry}
          title="다시 요청"
        >
          <FaRedo size={12} />
        </button>
      )}
    </div>
  );
};

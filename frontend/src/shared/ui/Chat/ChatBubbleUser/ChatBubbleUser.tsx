// features/chat/components/ChatBubbleUser/ChatBubbleUser.tsx
import styles from './ChatBubbleUser.module.css';

interface ChatBubbleUserProps {
  text: string;
}

export const ChatBubbleUser = ({ text }: ChatBubbleUserProps) => {
  return (
    <div className={styles['chatBubbleUser-wrapper']}>
      <div className={styles['chatBubbleUser-bubble']}>{text}</div>
    </div>
  );
};

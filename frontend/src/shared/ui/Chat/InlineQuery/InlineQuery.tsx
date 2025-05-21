import styles from './InlineQuery.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InlineQuery = ({ sql }: { sql: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles['inlineQuery-wrapper']}>
      <button
        className={styles['inlineQuery-toggleButton']}
        onClick={toggleOpen}
        type="button"
      >
        {isOpen ? 'SQL 코드 닫기' : 'SQL 코드 보기'}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.pre
            className={styles['inlineQuery-block']}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <code>{sql}</code>
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
};

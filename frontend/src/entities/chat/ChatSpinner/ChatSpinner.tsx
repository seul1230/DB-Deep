import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatSpinner.module.css';

const tips = [
  'Tip 1: 명확한 질문은 더 정확한 답변을 이끌어냅니다.',
  'Tip 2: 데이터 범위를 지정하면 결과가 빨라집니다.',
  'Tip 3: 미사여구와 비속어는 삼가해주세요.',
  'Tip 4: 인사 데이터는 인사팀만 열람이 가능합니다.',
  'Tip 5: 나만의 용어 사전을 DBDeep에게 학습시켜주세요.',
];

export const ChatSpinner: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles['chatspinner-root']}>
      <div className={styles['chatspinner-header']}>
        <div className={styles['chatspinner-spinner']} />
        <span className={styles['chatspinner-text']}>응답 생성 중</span>
      </div>
      <div className={styles['chatspinner-tipContainer']}>
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={styles['chatspinner-tip']}
          >
            {tips[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

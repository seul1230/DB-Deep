import styles from './InlineQuery.module.css';

export const InlineQuery = ({ sql }: { sql: string }) => {
  return (
    <div className={styles['inlineQuery-wrapper']}>
      <pre className={styles['inlineQuery-block']}>
        <code>{sql}</code>
      </pre>
    </div>
  );
};

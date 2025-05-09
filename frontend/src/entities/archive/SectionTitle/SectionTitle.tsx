import React from "react";
import styles from "./SectionTitle.module.css";

interface Props {
  text: string;
}

const SectionTitle: React.FC<Props> = ({ text }) => (
  <div className={styles.titleWrapper}>
    <h1 className={styles.title}>{text}</h1>
    <div className={styles.divider} />
  </div>
);

export default SectionTitle;

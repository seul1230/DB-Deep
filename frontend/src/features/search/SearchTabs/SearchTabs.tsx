import React from "react";
import styles from "./SearchTabs.module.css";

interface Props {
  active: string;
  onSelect: (val: string) => void;
}

const tabs = ["전체", "아카이브"];

const SearchTabs: React.FC<Props> = ({ active, onSelect }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`${styles.tab} ${active === tab ? styles.tabActive : ""}`}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default SearchTabs;
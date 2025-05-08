import React from "react";
import styles from "./SearchInput.module.css";
import { FiSearch } from "react-icons/fi";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const SearchInput: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className={styles.searchBox}>
      <FiSearch />
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
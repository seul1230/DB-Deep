import React from "react";
import styles from "./SearchInput.module.css";
import { FiSearch } from "react-icons/fi";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
}

const SearchInput: React.FC<Props> = ({ value, onChange, onSubmit }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handleIconClick = () => {
    onSubmit?.();
  };

  return (
    <div className={styles.searchBox}>
      <FiSearch onClick={handleIconClick} style={{ cursor: "pointer" }} />
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchInput;

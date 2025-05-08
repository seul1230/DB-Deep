// widgets/SearchOverlay/SearchOverlay.tsx
import React, { useEffect, useRef } from "react";
import styles from "./SearchOverlay.module.css";
import { FiCopy, FiTrash2 } from "react-icons/fi";
import { useSearchOverlayStore } from "@/shared/store/useSearchOverlayStore";

const SearchOverlay: React.FC = () => {
  const { isOpen, position, targetId, closeOverlay } = useSearchOverlayStore();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeOverlay();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOverlay]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={styles.SearchOverlay}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <div
        className={styles.SearchOverlayItem}
        onClick={() => {
          console.log("복사 대상:", targetId);
          closeOverlay();
        }}
      >
        <FiCopy /> 복사
      </div>
      <div
        className={styles.SearchOverlayItem}
        onClick={() => {
          console.log("삭제 대상:", targetId);
          closeOverlay();
        }}
      >
        <FiTrash2 /> 삭제
      </div>
    </div>
  );
};

export default SearchOverlay;

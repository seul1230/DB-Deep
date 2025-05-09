import React, { useEffect, useRef } from "react";
import styles from "./CardOverlay.module.css";
import { FiCopy } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CardOverlayProps } from "./Card.types";

const CardOverlay: React.FC<CardOverlayProps> = ({
  position,
  targetId,
  onCopy,
  onDelete,
  showDelete = false,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={styles.CardOverlay}
      style={{
        top: position.top,
        left: position.left,
        position: "fixed",
        zIndex: 3000,
      }}
    >
      <div className={styles.CardOverlayItem} onClick={() => onCopy(targetId)}>
        <FiCopy /> 복사
        </div>
        {showDelete && onDelete && (
        <div className={styles.CardOverlayItemDanger} onClick={() => onDelete(targetId)}>
    <RiDeleteBin6Line /> 삭제
  </div>
)}
    </div>
  );
};

export default CardOverlay;
import React, { useEffect, useRef } from "react";
import styles from "./ArchiveOverlay.module.css";
import { FiCopy } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useArchiveOverlayStore } from "@/shared/store/useArchiveOverlayStore";

const ArchiveOverlay: React.FC = () => {
    const { isOpen, position, targetId, closeOverlay, setOverlayRef } = useArchiveOverlayStore();
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      setOverlayRef(ref.current);
      return () => setOverlayRef(null);
    }, [ref.current]); // ref.current가 변화할 때만 실행
  
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const { overlayRef } = useArchiveOverlayStore.getState();
        if (overlayRef && !overlayRef.contains(e.target as Node)) {
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
      className={styles.ArchiveOverlay}
      style={{ top: position.top-10, left: position.left+8, position: "absolute" }}
    >
      <div className={styles.ArchiveOverlayItem} onClick={() => {
        console.log("복사: ", targetId);
        closeOverlay();
      }}>
        <FiCopy /> 복사
      </div>
      <div className={styles.ArchiveOverlayItemDanger} onClick={() => {
        console.log("삭제: ", targetId);
        closeOverlay();
      }}>
        <RiDeleteBin6Line /> 아카이브에서 삭제
      </div>
    </div>
  );
};

export default ArchiveOverlay;
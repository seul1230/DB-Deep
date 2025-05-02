import React, { useEffect, useRef } from "react";
import styles from "./ProfileOverlay.module.css";
import { FiLock } from "react-icons/fi";
import { TbLogout } from "react-icons/tb";

interface ProfileOverlayProps {
  onClose: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}

const ProfileOverlay: React.FC<ProfileOverlayProps> = ({
  onClose,
  onLogout,
  onChangePassword,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles["ProfileOverlay-container"]} ref={overlayRef}>
      <button
        className={styles["ProfileOverlay-button"]}
        onClick={onChangePassword}
      >
        <FiLock size={16} className={styles["ProfileOverlay-icon"]} />
        비밀번호 변경
      </button>
      <button
        className={styles["ProfileOverlay-button"]}
        onClick={onLogout}
      >
        <TbLogout size={16} className={styles["ProfileOverlay-icon"]} />
        로그아웃
      </button>
    </div>
  );
};

export default ProfileOverlay;

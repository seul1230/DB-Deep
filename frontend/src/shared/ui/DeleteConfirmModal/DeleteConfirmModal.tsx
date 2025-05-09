import React from "react";
import styles from "./DeleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  message?: React.ReactNode;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ onCancel, onConfirm, message }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>채팅방 삭제</h2>
        <p className={styles.subtitle}>
            {message}
        </p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>취소</button>
          <button className={styles.confirmButton} onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

import React from "react";
import styles from "./DeleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
  title?: string;
  message?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title = "삭제 확인",
  message = "정말로 삭제하시겠습니까?",
  onCancel,
  onConfirm,
  confirmText = "삭제",
  cancelText = "취소",
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

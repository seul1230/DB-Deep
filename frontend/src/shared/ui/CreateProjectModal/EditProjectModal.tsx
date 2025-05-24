import React, { useState } from "react";
import styles from "./ProjectModal.module.css"; // 같은 스타일 재사용

interface EditProjectModalProps {
  initialName: string;
  initialDescription?: string;
  onClose: () => void;
  onEdit: (newName: string, newDescription: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  initialName,
  initialDescription = "",
  onClose,
  onEdit,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("프로젝트 이름을 입력해주세요.");
      return;
    }
    onEdit(name.trim(), description.trim());
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>프로젝트 정보 수정</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="프로젝트 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="프로젝트 설명 (선택)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <button className={styles.confirm} onClick={handleSubmit}>
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;

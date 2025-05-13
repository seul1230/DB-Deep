import React, { useState } from "react";
import styles from "./CreateProjectModal.module.css";

interface Props {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const CreateProjectModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("프로젝트 이름을 입력해주세요.");
      return;
    }
    onCreate(name.trim(), description.trim());
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>새 프로젝트 생성</h2>
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
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
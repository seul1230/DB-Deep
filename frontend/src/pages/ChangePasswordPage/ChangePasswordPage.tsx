import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ChangePasswordPage.module.css";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

const ChangePasswordPage: React.FC = () => {
  const location = useLocation();
  const reason = location.state?.reason || "manual";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("비밀번호가 변경되었습니다!");
  };

  return (
    <div className={styles["ChangePasswordPage-wrapper"]}>
      <h2 className={styles["ChangePasswordPage-title"]}>비밀번호 변경</h2>
      <p className={styles["ChangePasswordPage-description"]}>
        {reason === "tempPassword"
          ? "임시 비밀번호로 로그인하셨습니다. 보안을 위해 새 비밀번호로 변경해 주세요."
          : "비밀번호를 주기적으로 변경하여 계정을 안전하게 관리하세요."}
      </p>
      <form onSubmit={handleSubmit} className={styles["ChangePasswordPage-form"]}>
        <div className={styles["ChangePasswordPage-inputGroup"]}>
          <label className={styles["ChangePasswordPage-label"]}>현재 비밀번호</label>
          <div className={styles["ChangePasswordPage-inputWrapper"]}>
            <FiLock className={styles["ChangePasswordPage-icon"]} size={16} />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles["ChangePasswordPage-input"]}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className={styles["ChangePasswordPage-eyeButton"]}
            >
              {showCurrent ? (
                <FiEye size={16} color="var(--gray-text)" />
              ) : (
                <FiEyeOff size={16} color="var(--gray-text)" />
              )}
            </button>
          </div>
        </div>

        <div className={styles["ChangePasswordPage-inputGroup"]}>
          <label className={styles["ChangePasswordPage-label"]}>새 비밀번호</label>
          <div className={styles["ChangePasswordPage-inputWrapper"]}>
            <FiLock className={styles["ChangePasswordPage-icon"]} size={16} />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles["ChangePasswordPage-input"]}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className={styles["ChangePasswordPage-eyeButton"]}
            >
              {showNew ? (
                <FiEye size={16} color="var(--gray-text)" />
              ) : (
                <FiEyeOff size={16} color="var(--gray-text)" />
              )}
            </button>
          </div>
        </div>

        <div className={styles["ChangePasswordPage-inputGroup"]}>
          <label className={styles["ChangePasswordPage-label"]}>비밀번호 확인</label>
          <div className={styles["ChangePasswordPage-inputWrapper"]}>
            <FiLock className={styles["ChangePasswordPage-icon"]} size={16} />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles["ChangePasswordPage-input"]}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles["ChangePasswordPage-eyeButton"]}
            >
              {showConfirm ? (
                <FiEye size={16} color="var(--gray-text)" />
              ) : (
                <FiEyeOff size={16} color="var(--gray-text)" />
              )}
            </button>
          </div>
        </div>

        <button type="submit" className={styles["ChangePasswordPage-submitButton"]}>
          비밀번호 변경
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

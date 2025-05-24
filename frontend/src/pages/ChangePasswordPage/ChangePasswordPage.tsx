import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ChangePasswordPage.module.css";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { useChangePassword } from "@/features/auth/useChangePassword";
import { AxiosError } from "axios";

const ChangePasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reason = location.state?.reason || "manual";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    mutate(
      { password: currentPassword, newPassword },
      {
        onSuccess: (data) => {
          alert(data.message);
          navigate("/main");
        },
        onError: (error) => {
          const axiosError = error as AxiosError;
          const status = axiosError?.response?.status;
          if (status === 400) {
            alert("잘못된 요청입니다.");
          } else if (status === 401) {
            alert("로그인이 필요합니다.");
          } else if (status === 403) {
            alert("접근 권한이 없습니다.");
          } else if (status === 500) {
            alert("서버 오류가 발생했습니다.");
          } else {
            alert("알 수 없는 오류가 발생했습니다.");
          }
        },
      }
    );
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

        <button
          type="submit"
          className={styles["ChangePasswordPage-submitButton"]}
          disabled={isPending}
        >
          {isPending ? "처리 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

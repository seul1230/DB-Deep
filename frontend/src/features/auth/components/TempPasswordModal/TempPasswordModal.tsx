import React, { useEffect, useState } from "react";
import styles from "./TempPasswordModal.module.css";
import { FiMail, FiX } from "react-icons/fi";
import Button from "@/shared/ui/Button/Button";

interface TempPasswordModalProps {
  onClose: () => void;
  onSend: (email: string) => void;
  onVerifyCode: (code: string) => void;
}

const TempPasswordModal: React.FC<TempPasswordModalProps> = ({
  onClose,
  onSend,
  onVerifyCode,
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isEmailSent && timer > 0 && timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEmailSent, timer, timerActive]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString();
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleEmailSend = () => {
    if (!email) return;
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    setEmailError("");
    setIsEmailSent(true);
    setTimer(180);
    setTimerActive(true);
    onSend(email);
  };

  const handleVerify = () => {
    if (code) onVerifyCode(code);
  };

  return (
    <div className={styles["TempPasswordModal-container"]}>
      <div className={styles["TempPasswordModal-header"]}>
        <h2 className={styles["TempPasswordModal-title"]}>임시 비밀번호 전송</h2>
        <button className={styles["TempPasswordModal-closeButton"]} onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>

      <p className={styles["TempPasswordModal-description"]}>
        기존에 가입하신 이메일을 입력하시면,<br />
        임시 비밀번호를 발급해드립니다.
      </p>

      <div className={styles["TempPasswordModal-inputRow"]}>
        <div className={styles["TempPasswordModal-inputWrapper"]}>
          <FiMail className={styles["TempPasswordModal-icon"]} />
          <input
            type="email"
            placeholder="example@dbdeep.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailSent}
            className={styles["TempPasswordModal-input"]}
          />
          {!isEmailSent && (
            <button className={styles["TempPasswordModal-inlineButton"]} onClick={handleEmailSend}>
              이메일 인증
            </button>
          )}
        </div>
        {emailError && <p className={styles["TempPasswordModal-error"]}>{emailError}</p>}
      </div>

      {isEmailSent && (
        <div className={styles["TempPasswordModal-inputRow"]}>
          <div className={styles["TempPasswordModal-codeWrapper"]}>
            <span className={styles["TempPasswordModal-timer"]}>{formatTime(timer)}</span>
            <input
              type="text"
              placeholder="인증번호를 입력해주세요"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles["TempPasswordModal-codeinput"]}
            />
            <button
              className={styles["TempPasswordModal-inlineButton"]}
              onClick={handleVerify}
              disabled={!code}
            >
              확인
            </button>
          </div>
        </div>
      )}

      
      <div className={styles["TempPasswordModal-buttonGroup"]}>
        <Button
          label="취소"
          onClick={onClose}
          borderColor="var(--icon-blue)"
          backgroundColor="var(--background-color)"
          textColor="var(--icon-blue)"
        />
        <Button
          label="전송"
          onClick={() => alert("전송 완료")}
          borderColor="var(--icon-blue)"
          backgroundColor="var(--icon-blue)"
          textColor="var(--background-color)"
          disabled={!isEmailSent}
        />
      </div>
    </div>
  );
};

export default TempPasswordModal;

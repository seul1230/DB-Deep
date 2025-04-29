import React, { useEffect, useState } from "react";
import styles from "./TempPasswordModal.module.css";
import { FiMail, FiX } from "react-icons/fi";

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
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);

  // 타이머 관리
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
    return `${min}분 ${sec}초`;
  };

  const handleEmailSend = () => {
    if (!email) return;
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
      <button className={styles["TempPasswordModal-closeButton"]} onClick={onClose}>
        <FiX size={20} />
      </button>

      <h2 className={styles["TempPasswordModal-title"]}>임시 비밀번호 전송</h2>
      <p className={styles["TempPasswordModal-description"]}>
        기존에 가입하신 이메일을 입력하시면,<br />
        임시 비밀번호를 발급해드립니다.
      </p>

      {/* 이메일 입력 */}
      <div className={styles["TempPasswordModal-row"]}>
        <div className={styles["TempPasswordModal-inputWrapper"]}>
          <FiMail className={styles["TempPasswordModal-icon"]} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailSent}
            placeholder="example.dbdeep.com"
            className={styles["TempPasswordModal-input"]}
          />
        </div>
        {!isEmailSent && (
          <button onClick={handleEmailSend} className={styles["TempPasswordModal-smallButton"]}>
            이메일 인증
          </button>
        )}
      </div>

      {/* 인증번호 입력 */}
      {isEmailSent && (
        <div className={styles["TempPasswordModal-row"]}>
          <span className={styles["TempPasswordModal-timer"]}>{formatTime(timer)}</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="인증번호 입력"
            className={styles["TempPasswordModal-codeInput"]}
          />
          <button
            onClick={handleVerify}
            className={styles["TempPasswordModal-smallButton"]}
            disabled={!code}
          >
            인증
          </button>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className={styles["TempPasswordModal-buttonGroup"]}>
        <button onClick={onClose} className={styles["TempPasswordModal-cancelButton"]}>
          취소
        </button>
        <button
          onClick={() => alert("전송 완료")}
          className={styles["TempPasswordModal-sendButton"]}
          disabled={!isEmailSent}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default TempPasswordModal;

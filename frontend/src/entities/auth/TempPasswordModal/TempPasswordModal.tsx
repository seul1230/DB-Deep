import React, { useEffect, useState } from "react";
import styles from "./TempPasswordModal.module.css";
import { FiMail, FiX } from "react-icons/fi";
import Button from "@/shared/ui/Button/Button";
import { useSendEmail, useVerifyCode } from "@/features/auth/useEmail";

interface TempPasswordModalProps {
  onClose: () => void;
}

const TempPasswordModal: React.FC<TempPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);

  const sendEmailMutation = useSendEmail();
  const verifyCodeMutation = useVerifyCode();

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

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSend = async () => {
    if (!email) return;
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    try {
      await sendEmailMutation.mutateAsync(email);
      setEmailError("");
      setIsEmailSent(true);
      setTimer(180);
      setTimerActive(true);
      alert("인증번호가 이메일로 전송되었습니다!");
    } catch {
      setEmailError("이메일 전송에 실패했습니다.");
    }
  };

  const handleVerify = async () => {
    try {
      await verifyCodeMutation.mutateAsync({ email, code: Number(code) });
      alert("인증 성공! 입력하신 이메일로 임시 비밀번호가 발급되었습니다.");
      onClose();
    } catch {
      alert("인증 실패. 다시 시도해주세요.");
    }
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
          <button
            className={styles["TempPasswordModal-inlineButton"]}
            onClick={handleEmailSend}
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending
              ? "전송 중..."
              : isEmailSent
              ? "인증번호 재발송"
              : "이메일 인증"}
          </button>
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
              disabled={!code || verifyCodeMutation.isPending}
            >
              {verifyCodeMutation.isPending ? "확인 중..." : "확인"}
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
      </div>
    </div>
  );
};

export default TempPasswordModal;

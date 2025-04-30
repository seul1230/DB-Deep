import React, { useState, useEffect } from "react";
import styles from "./LoginPage.module.css";
import loginLeftImage from "@/assets/LoginLeftSide.png";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import TempPasswordModal from "@/features/auth/components/TempPasswordModal/TempPasswordModal";
import { AxiosError } from "axios";
import { useLogin } from "@/features/auth/hooks/useLogin";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false); // << 추가해야 함
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);    
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          alert(data.message);
        },
        onError: (error: AxiosError) => {
          const status = error?.response?.status;
          if (status === 400) {
            alert("요청이 잘못되었습니다.");
          } else if (status === 401) {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
          } else if (status === 500) {
            alert("서버 오류가 발생했습니다.");
          } else {
            alert("네트워크 오류가 발생했습니다.");
          }
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openModal = () => {
    setShowModal(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 300); // 0.3초 후 완전 제거
  };

  return (
    <div className={styles["LoginPage-wrapper"]}>
      <div className={styles["LoginPage-container"]}>
        <div className={styles["LoginPage-left"]}>
          <img src={loginLeftImage} alt="Login Left Side" className={styles["LoginPage-image"]} />
        </div>
        <div className={styles["LoginPage-right"]}>
          <div className={styles["LoginPage-box"]}>
            <form onSubmit={handleSubmit} className={styles["LoginPage-form"]}>
              <div className={styles["LoginPage-title"]}>로그인</div>

              <div className={styles["LoginPage-inputGroup"]}>
                <label className={styles["LoginPage-label"]}>이메일 아이디</label>
                <div className={styles["LoginPage-inputWrapper"]}>
                  <FiMail className={styles["LoginPage-icon"]} size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles["LoginPage-input"]}
                    placeholder="example@dbdeep.com"
                    required
                  />
                </div>
              </div>

              <div className={styles["LoginPage-inputGroup"]}>
                <label className={styles["LoginPage-label"]}>비밀번호</label>
                <div className={styles["LoginPage-inputWrapper"]}>
                  <FiLock className={styles["LoginPage-icon"]} size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles["LoginPage-input"]}
                    placeholder="******"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles["LoginPage-eyeButton"]}
                  >
                    {showPassword ? (
                      <FiEye size={16} color="var(--gray-text)" />
                    ) : (
                      <FiEyeOff size={16} color="var(--gray-text)" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles["LoginPage-button"]}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "로딩 중..." : "로그인"}
              </button>

              <p className={styles["LoginPage-forgot"]}>
                비밀번호를{" "}
                <strong
                  className={styles["LoginPage-forgotLink"]}
                  onClick={openModal}
                >
                  잊어버리셨나요?
                </strong>
              </p>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className={`${styles["LoginPage-modalOverlay"]} ${
            isClosing ? styles["fadeOut"] : styles["fadeIn"]
          }`}
          onClick={closeModal}
        >
          <div className={styles["LoginPage-modalContent"]} onClick={(e) => e.stopPropagation()}>
            <TempPasswordModal
              onClose={closeModal}
              onSend={(email) => console.log("이메일 전송:", email)}
              onVerifyCode={(code) => console.log("인증번호 검증:", code)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

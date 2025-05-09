import React, { useState, useEffect } from "react";
import styles from "./LoginPage.module.css";
import loginLeftImage from "../../assets/loginLeftSide.png";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { lazy, Suspense } from "react";
import { AxiosError } from "axios";
import { useLogin } from "@/features/auth/useLogin";
import { useAuth } from "@/features/auth/useAuth";
import { useNavigate } from "react-router-dom";
import logoLight from "../../assets/logo.png";
import logoDark from "../../assets/logo-dark.png";
import { useThemeStore } from "@/shared/store/themeStore";

const TempPasswordModal = lazy(() => import("@/entities/auth/TempPasswordModal/TempPasswordModal"));

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);    
  const loginMutation = useLogin();
  const navigate = useNavigate();  
  const { theme } = useThemeStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          const profile = useAuth.getState().profile;
          if (profile?.passwordNotChanged) {
            navigate("/change-password");
          } else {
            navigate("/main");
          }
        },        
        onError: (error) => {
          const axiosError = error as AxiosError<{ message: string }>;
          const message = axiosError.response?.data?.message || "예상치 못한 오류가 발생했습니다.";
          alert(message);
        }        
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

            {/* 모바일 전용 로고, theme 기반 src 적용 */}
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Logo"
              className={styles["LoginPage-mobileLogo"]}
            />

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
            <Suspense>
              <TempPasswordModal
                onClose={closeModal}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

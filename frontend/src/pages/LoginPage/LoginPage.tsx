/* src/pages/LoginPage/LoginPage.tsx */

import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import loginLeftImage from "../../assets/LoginLeftSide.png";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`로그인 시도: ${email}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
                    placeholder="example.dbdeep.com"
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
                      <FiEyeOff size={18} color="var(--gray-text)" />
                    ) : (
                      <FiEye size={18} color="var(--gray-text)" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles["LoginPage-button"]}>
                로그인
              </button>

              <p className={styles["LoginPage-forgot"]}>
                <span>비밀번호를 </span>
                <strong>잊어버리셨나요?</strong>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
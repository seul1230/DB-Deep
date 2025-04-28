import React, { useState, Suspense, lazy, FormEvent } from "react";
import "../styles/colors.css";
import "../styles/login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const BackgroundImage = lazy(() => import("../components/login/BackgroundImage"));

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          if (email === "admin@dbdeep.com" && password === "password123") {
            resolve("로그인 성공");
          } else {
            reject(new Error("이메일 또는 비밀번호가 올바르지 않습니다."));
          }
        }, 1500)
      );
      alert("로그인 성공!");
    } catch (err: any) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginpage-container">
      {/* 왼쪽 전체 이미지 */}
      <Suspense fallback={<div className="backgroundimage-left" />}>
        <BackgroundImage />
      </Suspense>

      {/* 오른쪽 로그인 폼 */}
      <div className="loginpage-right">
        <form onSubmit={handleLogin} className="loginpage-form">
          <div>
            <label>이메일 아이디</label>
            <input
              type="email"
              placeholder="example.dbdeep.com"
              className="loginpage-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="loginpage-password-wrapper">
            <label>비밀번호</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="******"
              className="loginpage-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="loginpage-password-toggle"
              onClick={togglePassword}
              disabled={loading}
            >
              {showPassword
                ? FiEye({ size: 16, color: "var(--gray-text)" })
                : FiEyeOff({ size: 16, color: "var(--gray-text)" })}
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p style={{ color: "var(--red-alert)", fontSize: "14px", marginTop: "-12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="loginpage-button"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "로딩 중..." : "로그인"}
          </button>

          <p className="loginpage-forgot-password">
            비밀번호를 <span>잊어버리셨나요?</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

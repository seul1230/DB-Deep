import React from "react";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import styles from "./Logo.module.css";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/shared/store/themeStore";

interface LogoProps {
  to?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ to = "/main", className = "" }) => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const logoSrc = theme === "dark" ? logoDark : logoLight;

  return (
    <img
      src={logoSrc}
      alt="DB Deep Logo"
      className={`${styles["Logo"]} ${className}`}
      onClick={() => navigate(to)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
    />
  );
};

export default Logo;

import React from "react";
import logo from "../../../assets/logo.png";
import styles from "./Logo.module.css";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  to?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ to = "/main", className = "" }) => {
  const navigate = useNavigate();

  return (
    <img
      src={logo}
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

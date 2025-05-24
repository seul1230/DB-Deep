import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  label: string;
  onClick: () => void;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  borderColor,
  backgroundColor,
  textColor,
  disabled = false,
}) => {
  return (
    <button
      className={styles["Button-root"]}
      onClick={onClick}
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor,
        color: textColor,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;

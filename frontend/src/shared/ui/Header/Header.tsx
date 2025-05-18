import React from "react";
import Logo from "@/shared/ui/Logo/Logo";
import styles from "./Header.module.css";

const Header: React.FC = () => {

  return (
    <header className={styles.header}>
      <Logo className={styles.logo} />
    </header>
  );
};

export default Header;
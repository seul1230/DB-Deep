import React, { useState } from "react";
import { FiBell, FiSearch, FiPlusSquare , FiFolderMinus, FiSun } from "react-icons/fi";
import { LuBookmarkMinus } from "react-icons/lu";
import { PiChatsBold  } from "react-icons/pi";
import { TbLogout } from "react-icons/tb";
import styles from "./Sidebar.module.css";
import { useLocation } from "react-router-dom";
import defaultProfileImage from "../../assets/default-profile.jpg";

const profileImageUrl: string | null = null; // 나중에 API 만들어지면 받을 변수

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasNotification, setHasNotification] = useState(false); // 실제는 API에서 받아올 값

  // 로그인 페이지에서는 사이드바 숨기기
  if (location.pathname === "/login") {
    return null;
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    // 여기서 실제 다크모드 적용 로직 추가하면 됨 (예: document.body.classList.toggle)
  };

  return (
    <aside className={styles["Sidebar-wrapper"]}>
      <div className={styles["Sidebar-top"]}>
        <img
          src={profileImageUrl || defaultProfileImage}
          alt="Profile"
          className={styles["Sidebar-profile"]}
          onError={(e) => {
            e.currentTarget.src = defaultProfileImage;
          }}
        />
      </div>
      <nav className={styles["Sidebar-nav"]}>
        <ul>
          <li>
            <div style={{ position: "relative" }}>
              <FiBell size={20} className={styles["Sidebar-icon"]} />
              {hasNotification && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 7,
                    height: 7,
                    backgroundColor: "var(--red-alert)",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>
            </li>
          <li><FiSearch size={20} className={styles["Sidebar-icon"]}/></li>
          <li><FiPlusSquare size={20} className={styles["Sidebar-icon"]}/></li>
          <li><PiChatsBold  size={20} className={styles["Sidebar-icon"]}/></li>
          <li><LuBookmarkMinus size={20} className={styles["Sidebar-icon"]}/></li>
          <li><FiFolderMinus size={20} className={styles["Sidebar-icon"]}/></li>
        </ul>
      </nav>

      <div className={styles["Sidebar-bottom"]}>
        <TbLogout size={20} className={styles["Sidebar-icon"]} />
        <label className={styles["Sidebar-toggleWrapper"]}>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
            className={styles["Sidebar-toggleInput"]}
          />
          <span className={styles["Sidebar-toggleSlider"]}>
            <FiSun className={styles["Sidebar-toggleIcon"]} />
          </span>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;

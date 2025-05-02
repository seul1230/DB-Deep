import React, { useEffect } from "react";
import { FiBell, FiSearch, FiPlusSquare, FiFolderMinus, FiSun, FiMoon } from "react-icons/fi";
import { LuBookmarkMinus } from "react-icons/lu";
import { PiChatsBold } from "react-icons/pi";
import { TbLogout } from "react-icons/tb";
import styles from "./Sidebar.module.css";
import { useLocation } from "react-router-dom";
import defaultProfileImage from "@/assets/default-profile.jpg";
import { useThemeStore } from "@/shared/store/themeStore";
import { usePanelStore } from "@/shared/store/usePanelStore"; //
import NotificationPanel from "@/widgets/NotificationPanel/NotificationPanel";

const profileImageUrl: string | null = null;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { openNotification, isNotificationOpen, hasNotification  } = usePanelStore();

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // 로그인 페이지에서는 사이드바 숨기기
  if (location.pathname === "/login") {
    return null;
  }

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
              <FiBell
                size={20}
                className={styles["Sidebar-icon"]}
                onClick={openNotification}
                style={{ cursor: "pointer" }}
              />
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
            <NotificationPanel isOpen={isNotificationOpen} />
          </li>
          <li><FiSearch size={20} className={styles["Sidebar-icon"]} /></li>
          <li><FiPlusSquare size={20} className={styles["Sidebar-icon"]} /></li>
          <li><PiChatsBold size={20} className={styles["Sidebar-icon"]} /></li>
          <li><LuBookmarkMinus size={20} className={styles["Sidebar-icon"]} /></li>
          <li><FiFolderMinus size={20} className={styles["Sidebar-icon"]} /></li>
        </ul>
      </nav>

      <div className={styles["Sidebar-bottom"]}>
        <TbLogout size={20} className={styles["Sidebar-icon"]} />
        <label className={styles["Sidebar-toggleWrapper"]}>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className={styles["Sidebar-toggleInput"]}
          />
          <span className={styles["Sidebar-toggleSlider"]}>
            <span className={styles["Sidebar-toggleKnob"]}>
              {theme === "light" ? (
                <FiSun className={styles["Sidebar-iconToggle"]} />
              ) : (
                <FiMoon className={styles["Sidebar-iconToggle"]} />
              )}
            </span>
          </span>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;

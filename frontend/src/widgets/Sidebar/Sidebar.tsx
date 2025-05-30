import React, { useEffect, useState } from "react";
import { FiBell, FiSearch, FiPlusSquare, FiFolderMinus, FiSun, FiMoon } from "react-icons/fi";
import { LuBookmarkMinus } from "react-icons/lu";
import { PiChatsBold } from "react-icons/pi";
import styles from "./Sidebar.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import defaultProfileImage from "@/assets/default-profile.jpg";
import { useThemeStore } from "@/shared/store/themeStore";
import ProfileOverlay from "../ProfileOverlay/ProfileOverlay";
import { useAuth } from "@/features/auth/useAuth";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useChartOverlayStore } from "@/features/chat/useChartOverlaystore";
import { useWebSocketConsoleStore } from "@/features/chat/useWebSocketConsoleStore";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { clearTokens, profile } = useAuth();
  const { chart, closeChart } = useChartOverlayStore();
  const { setConsoleOpen } = useWebSocketConsoleStore();

  const [showOverlay, setShowOverlay] = useState(false);
  const { hasNotification, toggleNotification, toggleChatLog, toggleProject } = usePanelStore();

  const profileImageUrl = profile?.imageUrl;
  
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // 로그인 페이지에서는 사이드바 숨기기
  if (location.pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login"; // 강제 로그아웃
  };

  const handleChangePassword = () => {
    setShowOverlay(false);
    navigate("/change-password", { state: { reason: "manual" } });
  };

  const handleGoToMain = () => {
    navigate("/main");
  };
  
  const handleGoToSearch = () => {
    navigate("/search");
  };

  const handleGoToArchive = () => {
    navigate("/archive");
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
          onClick={() => setShowOverlay((prev) => !prev)}
        />
        {showOverlay && (
          <ProfileOverlay
            onClose={() => setShowOverlay(false)}
            onLogout={handleLogout}
            onChangePassword={handleChangePassword}
          />
        )}
      </div>

      <nav className={styles["Sidebar-nav"]}>
        <ul>
          <li>
            <div style={{ position: "relative" }}>
              <FiBell
                size={20}
                className={styles["Sidebar-icon"]}
                onClick={() => {
                  if (chart) {
                    closeChart();
                    setConsoleOpen(false);
                  }
                  toggleNotification();
                }}
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
          </li>
          <li>
            <FiSearch
              size={20}
              className={styles["Sidebar-icon"]}
              onClick={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
                handleGoToSearch();
              }}
              style={{ cursor: "pointer" }}
            />
          </li>
          <li>
            <FiPlusSquare
              size={20}
              className={styles["Sidebar-icon"]}
              onClick={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
                handleGoToMain();
              }}
              style={{ cursor: "pointer" }}
            />
          </li>
          <li>
            <PiChatsBold
              size={20}
              className={styles["Sidebar-icon"]}
              onClick={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
                toggleChatLog();
              }}
              style={{ cursor: "pointer" }}
            />
          </li>
          <li>
            <LuBookmarkMinus
              size={20}
              className={styles["Sidebar-icon"]}
              onClick={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
                handleGoToArchive();
              }}
              style={{ cursor: "pointer" }}
            />
          </li>
          <li>
            <FiFolderMinus
              size={20}
              className={styles["Sidebar-icon"]}
              onClick={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
                toggleProject();
              }}
              style={{ cursor: "pointer" }}
            />
          </li>
        </ul>
      </nav>

      <div className={styles["Sidebar-bottom"]}>
        <label className={styles["Sidebar-toggleWrapper"]}>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => {
                if (chart) {
                  closeChart();
                  setConsoleOpen(false);
                }
              toggleTheme();
            }}
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

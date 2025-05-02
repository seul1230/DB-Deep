import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/widgets/Sidebar/Sidebar";
import Logo from "@/shared/ui/Logo/Logo";
import { usePanelStore } from "@/shared/store/usePanelStore";

const SIDEBAR_WIDTH = 68;
const PANEL_WIDTH = 168;

const Layout: React.FC = () => {
  const { isNotificationOpen } = usePanelStore();

  const shiftMain = isNotificationOpen ? 168 : 0;
  const shiftLogo = isNotificationOpen ? 360 : 0;
  const scrollAreaWidth = isNotificationOpen
    ? `calc(100vw - ${SIDEBAR_WIDTH + PANEL_WIDTH}px)`
    : `calc(100vw - ${SIDEBAR_WIDTH}px)`;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          zIndex: 1000,
        }}
      >
        <Sidebar />
      </div>

      <div
        style={{
          position: "absolute",    
          left: SIDEBAR_WIDTH, 
          top: 0,
          width: scrollAreaWidth,
          height: "100vh",
          overflow: "auto",
          transition: "width 0.3s ease",
        }}
      >

        <div
          style={{
            position: "absolute",
            top: 0,
            left: -SIDEBAR_WIDTH,
            transform: `translateX(${shiftLogo}px)`,
            transition: "transform 0.3s ease",
            zIndex: 999,
          }}
        >
          <Logo />
        </div>

        <div
          style={{
            transform: `translateX(${shiftMain}px)`,
            transition: "transform 0.3s ease",
            left: -68,
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/widgets/Sidebar/Sidebar";
import Logo from "@/shared/ui/Logo/Logo";
import { usePanelStore } from "@/shared/store/usePanelStore";
import NotificationPanel from "../NotificationPanel/NotificationPanel";

const SIDEBAR_WIDTH = 68;
const PANEL_WIDTH = 240;

const Layout: React.FC = () => {
  const { isNotificationOpen } = usePanelStore();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ✅ 왼쪽 영역 (Sidebar + 알림 패널) */}
      <div style={{
        display: 'flex',
        flexShrink: 0,
        flexDirection: 'row',
        width: isNotificationOpen ? SIDEBAR_WIDTH + PANEL_WIDTH : SIDEBAR_WIDTH,
        transition: 'width 0.3s ease',
      }}>
        {/* Sidebar */}
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'relative',
            zIndex: 1000,
          }}
        >
          <Sidebar />
        </div>

        {/* 패널 */}
        {isNotificationOpen && (
          <div
            style={{
              width: PANEL_WIDTH,
              flexShrink: 0,
              borderLeft: '1px solid var(--light-gray)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              transition: 'all 0.3s ease',
            }}
          >
            <NotificationPanel isOpen={true} />
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Logo />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

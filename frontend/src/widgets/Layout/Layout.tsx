import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/widgets/Sidebar/Sidebar";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { useWebSocketConsoleStore } from "@/features/chat/useWebSocketConsoleStore";
import NotificationPanel from "../NotificationPanel/NotificationPanel";
import ChatLogPanel from "../ChatLogPanel/ChatLogPanel";
import ProjectPanel from "../ProjectPanel/ProjectPanel";
import Header from "@/shared/ui/Header/Header";
import WebSocketConsole from "@/widgets/WebSocketConsole/WebSocketConsole";
import ChartOverlay from "@/entities/chat/ChartOverlay/ChartOverlay";
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { convertChartData } from '@/types/chart';

const SIDEBAR_WIDTH = 68;
const PANEL_WIDTH = 240;
const CONSOLE_WIDTH = 260;

const Layout: React.FC = () => {
  const { openPanel } = usePanelStore();
  const { isOpen: isConsoleOpen } = useWebSocketConsoleStore();
  const { chart, closeChart } = useChartOverlayStore();

  const isNotificationOpen = openPanel === "notification";
  const isChatLogOpen = openPanel === "chatLog";
  const isProjectOpen = openPanel === "project";
  const isAnyPanelOpen = isNotificationOpen || isChatLogOpen || isProjectOpen;

  const leftWidth = isAnyPanelOpen ? SIDEBAR_WIDTH + PANEL_WIDTH : SIDEBAR_WIDTH;
  const rightOffset = isConsoleOpen ? CONSOLE_WIDTH : 0;

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 사이드바 및 패널 영역 */}
      <div
        style={{
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'row',
          width: leftWidth,
          transition: 'width 0.3s ease',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          <Sidebar />
        </div>
  
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
              boxSizing: 'border-box'
            }}
          >
            <NotificationPanel isOpen />
          </div>
        )}
        {isChatLogOpen && (
          <div
            style={{
              width: PANEL_WIDTH,
              flexShrink: 0,
              borderLeft: '1px solid var(--light-gray)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              boxSizing: 'border-box'
            }}
          >
            <ChatLogPanel />
          </div>
        )}
        {isProjectOpen && (
          <div
            style={{
              width: PANEL_WIDTH,
              flexShrink: 0,
              borderLeft: '1px solid var(--light-gray)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              boxSizing: 'border-box'
            }}
          >
            <ProjectPanel />
          </div>
        )}
      </div>
  
      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'padding-right 0.3s ease',
          paddingRight: `${rightOffset}px`,
        }}
      >
        {chart ? (
          <ChartOverlay chartData={convertChartData(chart)} onClose={closeChart} />
        ) : (
          <>
            <Header />
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <Outlet />
            </div>
          </>
        )}
      </div>
  
      {/* WebSocket 우측 콘솔 */}
      <WebSocketConsole />
    </div>
  );
  
};

export default Layout;

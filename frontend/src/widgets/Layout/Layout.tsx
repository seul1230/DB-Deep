import React from "react";
import Sidebar from "../../widgets/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Logo from "../../shared/ui/Logo/Logo";

const Layout: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <Logo />
      <div style={{ flex: 1, paddingLeft: "68px" }}>
        <Outlet />
      </div>
    </div>
  );
};


export default Layout;
import React, { useState } from "react";
import SideMenu from "./SideMenu";
import Header from "./Header";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <div className="layout">
      <SideMenu
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;

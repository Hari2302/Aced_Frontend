import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell relative flex h-screen overflow-hidden">
      <span className="admin-glow-dot one" />
      <span className="admin-glow-dot two" />

      <SuperAdminSidebar isMobileOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

      <main className="relative h-screen flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:ml-72 md:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <button type="button" onClick={() => setIsSidebarOpen(prev => !prev)} className="admin-secondary-btn admin-icon-btn" aria-label={isSidebarOpen ? "Close Menu" : "Open Menu"} title={isSidebarOpen ? "Close Menu" : "Open Menu"}>
            <span className={`admin-menu-icon ${isSidebarOpen ? "is-open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div className="min-w-0 text-right">
            <p className="admin-title truncate text-base font-bold text-emerald-950">Kongu Neet Ac</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Academy</p>
          </div>
        </div>
        <div className="admin-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;

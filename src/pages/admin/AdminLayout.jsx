import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import AdminChatbot from "../../components/layout/AdminChatbot";
import { Outlet } from "react-router-dom";
import {
  getAdminSettings,
  subscribeAdminSettings,
} from "../../services/adminSettingsService";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(() => getAdminSettings());

  useEffect(() => subscribeAdminSettings(setSettings), []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "admin-reduced-motion",
      Boolean(settings.reducedMotion),
    );
    return () => {
      document.documentElement.classList.remove("admin-reduced-motion");
    };
  }, [settings.reducedMotion]);

  return (
    <div className="admin-shell relative flex h-screen overflow-hidden">
      <span className="admin-glow-dot one" />
      <span className="admin-glow-dot two" />

      <Sidebar compactMode={settings.compactSidebar} isMobileOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

      <main className={`relative h-screen flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 ${settings.compactSidebar ? "md:ml-24" : "md:ml-72"}`}>
        <div className="md:hidden mb-3">
          <button type="button" onClick={() => setIsSidebarOpen(prev => !prev)} className="admin-secondary-btn">
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>
        <div className="admin-page-enter">
          <Outlet />
        </div>
        <AdminChatbot />
      </main>
    </div>
  );
};

export default AdminLayout;

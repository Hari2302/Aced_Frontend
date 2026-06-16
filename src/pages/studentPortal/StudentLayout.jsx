import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../../components/layout/StudentSidebar";

const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell relative flex h-screen overflow-hidden">
      <span className="admin-glow-dot one" />
      <span className="admin-glow-dot two" />

      <StudentSidebar isMobileOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

      <main className="relative h-screen flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:ml-72 md:p-6 lg:p-8">
        <div className="md:hidden mb-3">
          <button type="button" onClick={() => setIsSidebarOpen(prev => !prev)} className="admin-secondary-btn">
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>
        <div className="admin-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;

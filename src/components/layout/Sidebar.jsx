import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({
  compactMode = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "DB" },
    { to: "/admin/students", label: "Students", icon: "ST" },
    { to: "/admin/teachers", label: "Teachers", icon: "TC" },
    { to: "/admin/classes", label: "Classes", icon: "CL" },
    { to: "/admin/timetable", label: "Time Table", icon: "TT" },
    // { to: "/admin/exams", label: "Exams", icon: "EX" },
    { to: "/admin/settings", label: "Settings", icon: "SE" },
  ];

  const linkClass = ({ isActive }) =>
    `group flex items-center rounded-xl border px-3 py-2.5 transition-all duration-200 ${
      compactMode ? "justify-center gap-0" : "gap-3"
    } ${
      isActive
        ? "border-emerald-100/60 bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-900 shadow-md shadow-emerald-900/10"
        : "border-transparent text-emerald-50/90 hover:border-emerald-100/20 hover:bg-emerald-900/40 hover:text-white"
    }`;

  const handleNavigate = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen ? (
        <button type="button" onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-label="Close sidebar" />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(74vw,18rem)] flex-col overflow-hidden border-r border-emerald-900/40 bg-gradient-to-b from-[#06281e] via-[#0b503a] to-[#072f23] p-5 text-white shadow-2xl shadow-emerald-950/40 transition-transform duration-200 md:fixed md:inset-y-0 md:left-0 md:p-6 ${compactMode ? "md:w-24" : "md:w-72"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className={`mb-6 rounded-2xl border border-emerald-100/20 bg-white/10 p-4 backdrop-blur-sm ${compactMode ? "text-center" : ""}`}>
          {!compactMode ? (
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/80">
              Admin Panel
            </p>
          ) : null}
          <h2 className={`admin-title mt-1 font-bold text-white ${compactMode ? "text-xl" : "text-2xl"}`}>
            {compactMode ? "KN" : "Kongu Neet"}
          </h2>
        </div>

        {!compactMode ? (
          <div className="mb-3 px-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100/70">
              Navigation
            </p>
          </div>
        ) : null}

        <nav className="flex-1 pr-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={handleNavigate}>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-[10px] font-bold tracking-wide transition-colors group-hover:bg-white/25">
                    {item.icon}
                  </span>
                  {!compactMode ? (
                    <span className="text-sm">{item.label}</span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 border-t border-emerald-100/20 pt-4">
          <button type="button" onClick={handleLogout} className={`group flex w-full rounded-xl border border-red-200/20 bg-red-500/10 px-3 py-2.5 text-left text-red-100 transition-colors hover:bg-red-500/20 hover:text-red-50 ${compactMode ? "items-center justify-center" : "items-center justify-between"}`}>
            <span className="text-sm font-medium">
              {compactMode ? "LO" : "Logout"}
            </span>
            {!compactMode ? (
              <span className="text-red-100/70 transition-transform group-hover:translate-x-0.5">
                {"->"}
              </span>
            ) : null}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

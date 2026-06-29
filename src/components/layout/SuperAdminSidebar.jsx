import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const SuperAdminSidebar = ({ isMobileOpen = false, onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/superadmin/dashboard", label: "Control Panel", icon: "CP" },
    { to: "/superadmin/students", label: "Student", icon: "ST" },
    { to: "/superadmin/teachers", label: "Teacher", icon: "TC" },
    { to: "/superadmin/admins", label: "Admin", icon: "AD" },
  ];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
      isActive
        ? "border-emerald-100/60 bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-900 shadow-md shadow-emerald-900/10"
        : "border-transparent text-emerald-50/90 hover:border-emerald-100/20 hover:bg-emerald-900/40 hover:text-white"
    }`;

  const closeMobile = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    closeMobile();
  };

  return (
    <>
      {isMobileOpen ? (
        <button type="button" onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-label="Close sidebar" />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(74vw,18rem)] flex-col overflow-hidden border-r border-emerald-900/40 bg-gradient-to-b from-[#06281e] via-[#0b503a] to-[#072f23] p-5 text-white shadow-2xl shadow-emerald-950/40 transition-transform duration-200 md:fixed md:inset-y-0 md:left-0 md:w-72 md:p-6 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="mb-6 rounded-2xl border border-emerald-100/20 bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/80">
            Super Admin
          </p>
          <h2 className="admin-title mt-1 text-2xl font-bold text-white">
            Kongu Neet
          </h2>
        </div>

        <div className="mb-3 px-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100/70">
            Oversight
          </p>
        </div>

        <nav className="flex-1 pr-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={closeMobile}>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-[10px] font-bold tracking-wide transition-colors group-hover:bg-white/25">
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 border-t border-emerald-100/20 pt-4">
          <button type="button" onClick={handleLogout} className="group flex w-full items-center justify-between rounded-xl border border-red-200/20 bg-red-500/10 px-3 py-2.5 text-left text-red-100 transition-colors hover:bg-red-500/20 hover:text-red-50">
            <span className="text-sm font-medium">Logout</span>
            <span className="text-red-100/70 transition-transform group-hover:translate-x-0.5">
              {"->"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;

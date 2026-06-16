import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({
  children,
  allowedRoles = [],
  loginPath = "/admin/login",
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map((r) => String(r).trim().toLowerCase()).includes(role)
  ) {
    if (role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (role === "superadmin")
      return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;

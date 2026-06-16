import { Navigate } from "react-router-dom";
import { getAdminSettings } from "../../services/adminSettingsService";

const AdminIndexRedirect = () => {
  const settings = getAdminSettings();
  return (
    <Navigate to={settings.defaultLandingPage || "/admin/dashboard"} replace />
  );
};

export default AdminIndexRedirect;

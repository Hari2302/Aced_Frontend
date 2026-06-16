import { SuperAdminSectionPage, useSuperAdminData } from "./superAdminShared";

const SuperAdminAdmins = () => {
  const { adminUsers, metrics, groupedLogs, loading, error } =
    useSuperAdminData();

  const rows = adminUsers.map((item) => ({
    UserName: item.UserName || "-",
    Role: item.Role || "-",
    Status: (item.IsActive ?? item.isActive) ? "Active" : "Inactive",
  }));

  if (loading)
    return (
      <p className="mb-4 text-sm text-gray-600">Loading admin management...</p>
    );
  if (error)
    return <p className="admin-card mb-4 p-4 text-sm text-red-700">{error}</p>;

  return (
    <SuperAdminSectionPage sectionKey="admin" title="Admin Management" subtitle="Review administrative users, roles, and system-level actions from a dedicated page." rows={rows} metrics={metrics} groupedLogs={groupedLogs} />
  );
};

export default SuperAdminAdmins;

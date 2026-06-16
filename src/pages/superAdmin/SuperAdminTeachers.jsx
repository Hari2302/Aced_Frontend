import { SuperAdminSectionPage, useSuperAdminData } from "./superAdminShared";

const SuperAdminTeachers = () => {
  const { teachers, metrics, groupedLogs, loading, error } =
    useSuperAdminData();

  const rows = teachers.map((item) => ({
    Name: item.TeacherName || item.Name || "-",
    Subject: item.SubjectName || item.Subject || "-",
    Status: (item.IsActive ?? item.isActive) ? "Active" : "Inactive",
  }));

  if (loading)
    return (
      <p className="mb-4 text-sm text-gray-600">
        Loading teacher management...
      </p>
    );
  if (error)
    return <p className="admin-card mb-4 p-4 text-sm text-red-700">{error}</p>;

  return (
    <SuperAdminSectionPage sectionKey="teacher" title="Teacher Management" subtitle="Monitor teacher accounts, operational activity, and academic publishing actions." rows={rows} metrics={metrics} groupedLogs={groupedLogs} />
  );
};

export default SuperAdminTeachers;

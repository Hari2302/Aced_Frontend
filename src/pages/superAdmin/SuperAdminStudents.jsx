import { SuperAdminSectionPage, useSuperAdminData } from "./superAdminShared";

const SuperAdminStudents = () => {
  const { students, metrics, groupedLogs, loading, error } =
    useSuperAdminData();

  const rows = students.map((item) => ({
    Name: item.StudentName || item.Name || "-",
    Class: item.ClassName || item.Class || "-",
    Status: (item.IsActive ?? item.isActive ?? true) ? "Active" : "Inactive",
  }));

  if (loading)
    return (
      <p className="mb-4 text-sm text-gray-600">
        Loading student management...
      </p>
    );
  if (error)
    return <p className="admin-card mb-4 p-4 text-sm text-red-700">{error}</p>;

  return (
    <SuperAdminSectionPage sectionKey="student" title="Student Management" subtitle="Review student counts, portal usage, and recent student-side activity in one place." rows={rows} metrics={metrics} groupedLogs={groupedLogs} />
  );
};

export default SuperAdminStudents;

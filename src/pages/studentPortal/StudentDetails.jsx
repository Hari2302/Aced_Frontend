import { useStudentPortalData } from "../../hooks/useStudentPortalData";

const StudentDetails = () => {
  const { loading, error, data } = useStudentPortalData();
  const profile = data?.student || {};

  const fields = [
    { label: "Student Name", value: profile.StudentName || "-" },
    { label: "Email", value: profile.Email || "-" },
    { label: "Phone Number", value: profile.MobileNumber || "-" },
    { label: "Class", value: profile.ClassName || "-" },
    { label: "Section", value: profile.Section || "-" },
    { label: "Study Mode", value: profile.StudyMode || "-" },
    { label: "Medium", value: profile.Medium || "-" },
  ];

  return (
    <main>
      <div className="admin-card p-5 md:p-6 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Student Details Section
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Profile details and class information.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading student details...</p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="admin-card p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.label} className="rounded-xl border border-slate-200 p-4 bg-white">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {field.label}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-800">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default StudentDetails;

import { useTeacherPortalData } from "./useTeacherPortalData";

const TeacherSection = () => {
  const { data, loading, error } = useTeacherPortalData();
  const homeworkCount = (data?.assignments || []).filter((a) =>
    String(a?.Title || "")
      .trim()
      .toLowerCase()
      .startsWith("hw -"),
  ).length;
  const assignmentCount = (data?.assignments || []).filter(
    (a) =>
      !String(a?.Title || "")
        .trim()
        .toLowerCase()
        .startsWith("hw -"),
  ).length;

  return (
    <div className="admin-page-enter">
      <div className="admin-card p-5 md:p-6 mb-6 bg-gradient-to-r from-[#0b5d42] via-[#0f8f5c] to-[#17a86f] text-white border-none">
        <p className="text-emerald-950 text-sm">Teacher Portal</p>
        <h1 className="admin-title text-2xl font-bold text-emerald-700">
          Section
        </h1>
        {/* <p className="text-emerald-100 text-sm mt-2">Class access details and quick summary.</p> */}
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
      {error ? <p className="text-sm text-red-700 mb-4">{error}</p> : null}

      {!loading && data ? (
        <>
          <div className="admin-card p-4 mb-6">
            <p className="text-sm text-slate-600">Teacher</p>
            <h2 className="admin-title text-xl font-bold text-emerald-900">
              {data.teacher?.TeacherName || "-"}
            </h2>
            <p className="text-sm text-slate-700 mt-1">
              Assigned Class: {data.teacher?.ClassName || "-"}{" "}
              {data.teacher?.Section ? `(${data.teacher.Section})` : ""}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="admin-card p-4">
              <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">
                Students
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {data.students?.length || 0}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">
                Assignments
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {assignmentCount}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">
                Homework
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {homeworkCount}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">
                Tests
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {data.tests?.length || 0}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TeacherSection;

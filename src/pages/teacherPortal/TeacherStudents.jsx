import { useTeacherPortalData } from "./useTeacherPortalData";

const TeacherStudents = () => {
  const { data, loading, error } = useTeacherPortalData();

  return (
    <div className="admin-page-enter">
      <div className="admin-card p-5 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Students
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Students from your assigned class.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
      {error ? <p className="text-sm text-red-700 mb-4">{error}</p> : null}

      {!loading && data ? (
        <div className="admin-card p-0 overflow-hidden">
          <div className="grid gap-3 p-4 md:hidden">
            {(data.students || []).length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-slate-500">
                No students found for your class.
              </div>
            ) : null}
            {(data.students || []).map((s) => (
              <article key={s.Id} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                <h3 className="break-words text-base font-bold text-slate-900">{s.StudentName || "-"}</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Mobile</p>
                    <p className="mt-1 break-words text-slate-800">{s.MobileNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
                    <p className="mt-1 break-words text-slate-800">{s.Email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Medium</p>
                    <p className="mt-1 text-slate-800">{s.Medium || "-"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm border-collapse">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Student
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Mobile
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Email
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Medium
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data.students || []).length === 0 ? (
                  <tr>
                    <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={4}>
                      No students found for your class.
                    </td>
                  </tr>
                ) : null}
                {(data.students || []).map((s) => (
                  <tr key={s.Id} className="admin-table-row">
                    <td className="py-2 px-3 border border-gray-300">
                      {s.StudentName || "-"}
                    </td>
                    <td className="py-2 px-3 border border-gray-300">
                      {s.MobileNumber || "-"}
                    </td>
                    <td className="py-2 px-3 border border-gray-300">
                      {s.Email || "-"}
                    </td>
                    <td className="py-2 px-3 border border-gray-300">
                      {s.Medium || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherStudents;

import { useStudentPortalData } from "../../hooks/useStudentPortalData";
import { formatDate } from "./studentPortalUtils";

const StudentHomework = () => {
  const { loading, error, data } = useStudentPortalData();
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
  const rows = assignments.filter((item) =>
    String(item?.Title || item?.title || "")
      .trim()
      .toLowerCase()
      .startsWith("hw -"),
  );

  return (
    <main>
      <div className="admin-card p-5 md:p-6 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Homework
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Homework assigned by your teacher for this class.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading homework...</p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="admin-card p-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="admin-table-head">
              <tr>
                <th className="text-left p-2 border border-emerald-900">
                  Title
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Description
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Deadline Date
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-2 border border-slate-200 text-slate-500" colSpan={3}>
                    No homework available.
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.Id || item.id} className="admin-table-row">
                    <td className="p-2 border border-slate-200">
                      {item.Title || item.title || "-"}
                    </td>
                    <td className="p-2 border border-slate-200 whitespace-pre-wrap break-words">
                      {item.Description || item.description || "-"}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {formatDate(
                        item.DeadlineDate ||
                          item.deadlineDate ||
                          item.DueDate ||
                          item.dueDate,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
};

export default StudentHomework;

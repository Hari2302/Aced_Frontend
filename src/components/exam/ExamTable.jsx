import { useMemo, useState } from "react";

const normalizeExam = (exam) => ({
  id: exam?.Id || exam?.id || exam?.ExamId || exam?.examId,
  examName: exam?.ExamName || exam?.examName || "-",
  classId: exam?.ClassId || exam?.classId || "-",
  examDate: exam?.ExamDate || exam?.examDate,
  totalMark: Number(exam?.TotalMark ?? exam?.totalMark ?? 0),
  timeTakeMinutes: Number(exam?.TimeTakeMinutes ?? exam?.timeTakeMinutes ?? 0),
  pdfUrl: exam?.PdfUrl || exam?.pdfUrl || "",
  originalFileName:
    exam?.OriginalFileName || exam?.originalFileName || "Exam PDF",
  isActive: Boolean(exam?.IsActive ?? exam?.isActive),
});

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const resolveLabel = (id, map) => {
  if (id === undefined || id === null || id === "-") return "-";
  return map[String(id)] || `ID: ${id}`;
};

const ExamTable = ({
  exams,
  classNameById = {},
  onEdit,
  onDelete,
  onViewPdf,
  actionLoadingId,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalized = useMemo(() => exams.map(normalizeExam), [exams]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.examName.toLowerCase().includes(query) ||
        String(exam.classId).toLowerCase().includes(query) ||
        resolveLabel(exam.classId, classNameById).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && exam.isActive) ||
        (statusFilter === "inactive" && !exam.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [classNameById, normalized, search, statusFilter]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "240ms" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className="admin-title font-semibold text-lg text-gray-800">
            Exam Schedule
          </h3>
          <p className="text-sm text-slate-500">
            Showing {filteredExams.length} records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exam / class" className="admin-input" />

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead className="admin-table-head">
            <tr>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Exam
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Class
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Exam Date
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Total Mark
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Time (Min)
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                PDF
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Status
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.length === 0 ? (
              <tr>
                <td className="py-5 px-3 text-gray-500 border border-gray-300" colSpan={8}>
                  No exams found for the selected filters.
                </td>
              </tr>
            ) : null}

            {filteredExams.map((exam) => (
              <tr key={exam.id} className="admin-table-row">
                <td className="py-3 px-3 font-medium text-gray-800 border border-gray-300">
                  {exam.examName}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {resolveLabel(exam.classId, classNameById)}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {formatDate(exam.examDate)}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {exam.totalMark}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {exam.timeTakeMinutes}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {exam.pdfUrl ? (
                    <button type="button" onClick={() => onViewPdf?.(exam)} className="text-emerald-700 underline">
                      View PDF
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${exam.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {exam.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(exam)} className="admin-action-icon-btn is-edit" aria-label="Edit exam" title="Edit">
                      <img src="/edit.svg" alt="" className="admin-action-icon" />
                    </button>
                    <button type="button" onClick={() => onDelete(exam)} disabled={actionLoadingId === exam.id} className="admin-action-icon-btn is-delete" aria-label="Delete exam" title={actionLoadingId === exam.id ? "Deleting" : "Delete"}>
                      <img src="/delete.svg" alt="" className="admin-action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamTable;

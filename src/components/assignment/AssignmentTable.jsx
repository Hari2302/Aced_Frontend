import { useMemo, useState } from "react";

const normalizeAssignment = (assignment) => ({
  id:
    assignment?.Id ||
    assignment?.id ||
    assignment?.AssignmentId ||
    assignment?.assignmentId,
  title: assignment?.Title || assignment?.title || "-",
  description: assignment?.Description || assignment?.description || "-",
  classId: assignment?.ClassId || assignment?.classId || "-",
  assignedByTeacherId:
    assignment?.AssignedByTeacherId || assignment?.assignedByTeacherId || "-",
  deadlineDate:
    assignment?.DeadlineDate ||
    assignment?.deadlineDate ||
    assignment?.DueDate ||
    assignment?.dueDate,
  isActive: Boolean(assignment?.IsActive ?? assignment?.isActive),
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

const daysLeft = (value) => {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.ceil(
    (target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / oneDay,
  );
};

const resolveLabel = (id, map) => {
  if (id === undefined || id === null || id === "-") return "-";
  return map[String(id)] || `ID: ${id}`;
};

const AssignmentTable = ({
  assignments,
  classNameById = {},
  teacherNameById = {},
  onEdit,
  onDelete,
  actionLoadingId,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalized = useMemo(
    () => assignments.map(normalizeAssignment),
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((assignment) => {
      const matchesSearch =
        !query ||
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        String(assignment.classId).toLowerCase().includes(query) ||
        String(assignment.assignedByTeacherId).toLowerCase().includes(query) ||
        resolveLabel(assignment.classId, classNameById)
          .toLowerCase()
          .includes(query) ||
        resolveLabel(assignment.assignedByTeacherId, teacherNameById)
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && assignment.isActive) ||
        (statusFilter === "inactive" && !assignment.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [classNameById, normalized, search, statusFilter, teacherNameById]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "220ms" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className="admin-title font-semibold text-lg text-gray-800">
            Assignment Tracker
          </h3>
          <p className="text-sm text-slate-500">
            Showing {filteredAssignments.length} records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title / description / class / teacher" className="admin-input" />

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
                Title
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Description
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Class
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Assigned By
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Deadline Date
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Timeline
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
            {filteredAssignments.length === 0 ? (
              <tr>
                <td className="py-5 px-3 text-gray-500 border border-gray-300" colSpan={8}>
                  No assignments found for the selected filters.
                </td>
              </tr>
            ) : null}

            {filteredAssignments.map((assignment) => {
              const remaining = daysLeft(assignment.deadlineDate);
              return (
                <tr key={assignment.id} className="admin-table-row">
                  <td className="py-3 px-3 font-medium text-gray-800 border border-gray-300">
                    {assignment.title}
                  </td>
                  <td className="py-3 px-3 border border-gray-300 max-w-xs whitespace-pre-wrap break-words">
                    {assignment.description}
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    {resolveLabel(assignment.classId, classNameById)}
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    {resolveLabel(
                      assignment.assignedByTeacherId,
                      teacherNameById,
                    )}
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    {formatDate(assignment.deadlineDate)}
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    {remaining === null ? (
                      "-"
                    ) : remaining >= 0 ? (
                      <span className="text-emerald-700">
                        {remaining} day(s) left
                      </span>
                    ) : (
                      <span className="text-red-600">
                        {Math.abs(remaining)} day(s) overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${assignment.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {assignment.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-3 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onEdit(assignment)} className="admin-action-icon-btn is-edit" aria-label="Edit assignment" title="Edit">
                        <img src="/edit.svg" alt="" className="admin-action-icon" />
                      </button>
                      <button type="button" onClick={() => onDelete(assignment)} disabled={actionLoadingId === assignment.id} className="admin-action-icon-btn is-delete" aria-label="Delete assignment" title={actionLoadingId === assignment.id ? "Deleting" : "Delete"}>
                        <img src="/delete.svg" alt="" className="admin-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentTable;

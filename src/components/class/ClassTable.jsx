import { useMemo, useState } from "react";

const normalizeClass = (classItem) => ({
  id:
    classItem?.Id || classItem?.id || classItem?.ClassId || classItem?.classId,
  className: classItem?.ClassName || classItem?.className || "-",
  section: classItem?.Section || classItem?.section || "-",
  isActive: Boolean(classItem?.IsActive ?? classItem?.isActive),
  createdDate: classItem?.CreatedDate || classItem?.createdDate,
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

const ClassTable = ({ classes, onEdit, onDelete, actionLoadingId }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalized = useMemo(() => classes.map(normalizeClass), [classes]);

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((classItem) => {
      const matchesSearch =
        !query ||
        classItem.className.toLowerCase().includes(query) ||
        classItem.section.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && classItem.isActive) ||
        (statusFilter === "inactive" && !classItem.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [normalized, search, statusFilter]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "200ms" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className="admin-title font-semibold text-lg text-gray-800">
            Class Directory
          </h3>
          <p className="text-sm text-slate-500">
            Showing {filteredClasses.length} records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search class / section" className="admin-input" />

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
                Class
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Section
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Created Date
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
            {filteredClasses.length === 0 ? (
              <tr>
                <td className="py-5 px-3 text-gray-500 border border-gray-300" colSpan={5}>
                  No classes found for the selected filters.
                </td>
              </tr>
            ) : null}

            {filteredClasses.map((classItem) => (
              <tr key={classItem.id} className="admin-table-row">
                <td className="py-3 px-3 font-medium text-gray-800 border border-gray-300">
                  {classItem.className}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {classItem.section}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {formatDate(classItem.createdDate)}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${classItem.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {classItem.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(classItem)} className="admin-action-icon-btn is-edit" aria-label="Edit class" title="Edit">
                      <img src="/edit.svg" alt="" className="admin-action-icon" />
                    </button>
                    <button type="button" onClick={() => onDelete(classItem)} disabled={actionLoadingId === classItem.id} className="admin-action-icon-btn is-delete" aria-label="Delete class" title={actionLoadingId === classItem.id ? "Deleting" : "Delete"}>
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

export default ClassTable;

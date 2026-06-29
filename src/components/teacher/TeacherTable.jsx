import { useMemo, useState } from "react";

const normalizeTeacher = (teacher) => ({
  id: teacher?.Id || teacher?.id || teacher?.TeacherId || teacher?.teacherId,
  teacherName: teacher?.TeacherName || teacher?.teacherName || "-",
  email: teacher?.Email || teacher?.email || "-",
  phoneNumber: teacher?.PhoneNumber || teacher?.phoneNumber || "-",
  subject: teacher?.Subject || teacher?.subject || "-",
  classId: teacher?.ClassId || teacher?.classId || "",
  bloodGroup: teacher?.BloodGroup || teacher?.bloodGroup || "-",
  address: teacher?.Address || teacher?.address || "-",
  salary: Number(teacher?.Salary ?? teacher?.salary ?? 0),
  isSalaryCredited: Boolean(
    teacher?.IsSalaryCredited ?? teacher?.isSalaryCredited,
  ),
  isActive: Boolean(teacher?.IsActive ?? teacher?.isActive),
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const TeacherTable = ({
  teachers,
  classNameById = {},
  onEdit,
  onDelete,
  onToggleSalary,
  actionLoadingId,
  salaryToggleLoadingId,
}) => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalized = useMemo(() => teachers.map(normalizeTeacher), [teachers]);
  const subjectOptions = useMemo(() => {
    const values = new Set(
      normalized
        .map((teacher) => teacher.subject)
        .filter((v) => v && v !== "-"),
    );
    return Array.from(values);
  }, [normalized]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((teacher) => {
      const matchesSearch =
        !query ||
        teacher.teacherName.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.phoneNumber.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query) ||
        String(classNameById[String(teacher.classId)] || "")
          .toLowerCase()
          .includes(query);

      const matchesSubject =
        subjectFilter === "all" || teacher.subject === subjectFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && teacher.isActive) ||
        (statusFilter === "inactive" && !teacher.isActive);

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [normalized, search, statusFilter, subjectFilter, classNameById]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-4 sm:p-5" style={{ animationDelay: "180ms" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className="admin-title font-semibold text-lg text-gray-800">
            Teacher Directory
          </h3>
          <p className="text-sm text-slate-500">
            Showing {filteredTeachers.length} records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teacher / email / phone / subject" className="admin-input" />

          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="admin-input">
            <option value="all">All Subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>


      <div className="grid gap-3 md:hidden">
        {filteredTeachers.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
            No teachers found for the selected filters.
          </div>
        ) : null}

        {filteredTeachers.map((teacher) => (
          <article key={teacher.id} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-base font-bold text-gray-900">
                  {teacher.teacherName}
                </h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {teacher.subject}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${teacher.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {teacher.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Class</p>
                <p className="mt-1 text-slate-800">{classNameById[String(teacher.classId)] || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Blood</p>
                <p className="mt-1 text-slate-800">{teacher.bloodGroup}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</p>
                <p className="mt-1 break-words text-slate-800">{teacher.phoneNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
                <p className="mt-1 break-words text-slate-800">{teacher.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Salary</p>
                <p className="mt-1 font-semibold text-slate-900">{formatCurrency(teacher.salary)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Salary Status</p>
                <p className={`mt-1 font-semibold ${teacher.isSalaryCredited ? "text-emerald-700" : "text-amber-700"}`}>
                  {teacher.isSalaryCredited ? "Credited" : "Pending"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => onToggleSalary(teacher)} disabled={salaryToggleLoadingId === teacher.id} className={`rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-60 ${teacher.isSalaryCredited ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                {salaryToggleLoadingId === teacher.id
                  ? "Updating..."
                  : teacher.isSalaryCredited
                    ? "Mark Pending"
                    : "Mark Credited"}
              </button>
              <button type="button" onClick={() => onEdit(teacher)} className="admin-action-icon-btn is-edit" aria-label="Edit teacher" title="Edit">
                <img src="/edit.svg" alt="" className="admin-action-icon" />
              </button>
              <button type="button" onClick={() => onDelete(teacher)} disabled={actionLoadingId === teacher.id} className="admin-action-icon-btn is-delete" aria-label="Delete teacher" title={actionLoadingId === teacher.id ? "Deleting" : "Delete"}>
                <img src="/delete.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-100 md:block">
        <table className="w-full text-sm border-collapse">
          <thead className="admin-table-head">
            <tr>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Name
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Email
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Phone
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Subject
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Class
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Blood
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Salary
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Salary Credited
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
            {filteredTeachers.length === 0 ? (
              <tr>
                <td className="py-5 px-3 text-gray-500 border border-gray-300" colSpan={10}>
                  No teachers found for the selected filters.
                </td>
              </tr>
            ) : null}

            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="admin-table-row">
                <td className="py-3 px-3 font-medium text-gray-800 border border-gray-300">
                  {teacher.teacherName}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {teacher.email}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {teacher.phoneNumber}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {teacher.subject}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {classNameById[String(teacher.classId)] || "-"}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {teacher.bloodGroup}
                </td>
                <td className="py-3 px-3 font-medium border border-gray-300">
                  {formatCurrency(teacher.salary)}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${teacher.isSalaryCredited ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {teacher.isSalaryCredited ? "Credited" : "Pending"}
                    </span>
                    <button type="button" onClick={() => onToggleSalary(teacher)} disabled={salaryToggleLoadingId === teacher.id} className={`px-2 py-1 rounded-md text-xs disabled:opacity-60 ${teacher.isSalaryCredited ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                      {salaryToggleLoadingId === teacher.id
                        ? "Updating..."
                        : teacher.isSalaryCredited
                          ? "Mark Pending"
                          : "Mark Credited"}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${teacher.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {teacher.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(teacher)} className="admin-action-icon-btn is-edit" aria-label="Edit teacher" title="Edit">
                      <img src="/edit.svg" alt="" className="admin-action-icon" />
                    </button>
                    <button type="button" onClick={() => onDelete(teacher)} disabled={actionLoadingId === teacher.id} className="admin-action-icon-btn is-delete" aria-label="Delete teacher" title={actionLoadingId === teacher.id ? "Deleting" : "Delete"}>
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

export default TeacherTable;

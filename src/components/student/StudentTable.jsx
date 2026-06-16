import { useMemo, useState } from "react";

const normalizeStudent = (student) => ({
  id: student?.Id || student?.id || student?.StudentId || student?.studentId,
  studentName: student?.StudentName || student?.studentName || "-",
  classId: student?.ClassId || student?.classId || "-",
  learningMode:
    student?.LearningMode ||
    student?.learningMode ||
    student?.StudyMode ||
    student?.studyMode ||
    student?.Mode ||
    student?.mode ||
    (student?.IsOnline === 1 ||
    student?.isOnline === 1 ||
    student?.IsOnline === true ||
    student?.isOnline === true
      ? "Online"
      : student?.IsOnline === 0 ||
          student?.isOnline === 0 ||
          student?.IsOnline === false ||
          student?.isOnline === false
        ? "Offline"
        : "-"),
  medium:
    student?.Medium ||
    student?.medium ||
    student?.LanguageMedium ||
    student?.languageMedium ||
    student?.InstructionMedium ||
    student?.instructionMedium ||
    "-",
  gender: student?.Gender || student?.gender || "-",
  bloodGroup: student?.BloodGroup || student?.bloodGroup || "-",
  mobileNumber: student?.MobileNumber || student?.mobileNumber || "-",
  email: student?.Email || student?.email || "-",
  parentOccupation:
    student?.ParentOccupation || student?.parentOccupation || "-",
  address: student?.Address || student?.address || "-",
  courseFees: Number(student?.CourseFees ?? student?.courseFees ?? 0),
  hostelFees: Number(student?.HostelFees ?? student?.hostelFees ?? 0),
  isActive: Boolean(student?.IsActive ?? student?.isActive),
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const StudentTable = ({ students, onEdit, onDelete, actionLoadingId }) => {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalized = useMemo(() => students.map(normalizeStudent), [students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((student) => {
      const matchesSearch =
        !query ||
        student.studentName.toLowerCase().includes(query) ||
        String(student.classId).toLowerCase().includes(query) ||
        student.mobileNumber.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.learningMode.toLowerCase().includes(query) ||
        student.medium.toLowerCase().includes(query);

      const matchesGender =
        genderFilter === "all" ||
        student.gender.toLowerCase() === genderFilter.toLowerCase();

      const matchesMode =
        modeFilter === "all" ||
        student.learningMode.toLowerCase() === modeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.isActive) ||
        (statusFilter === "inactive" && !student.isActive);

      return matchesSearch && matchesGender && matchesMode && matchesStatus;
    });
  }, [genderFilter, modeFilter, normalized, search, statusFilter]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "160ms" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className="admin-title font-semibold text-lg text-gray-800">
            Student Directory
          </h3>
          <p className="text-sm text-slate-500">
            Showing {filteredStudents.length} records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full md:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / class / mobile / email / mode" className="admin-input" />

          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="admin-input">
            <option value="all">All Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="admin-input">
            <option value="all">All Mode</option>
            <option value="online">Online Std</option>
            <option value="offline">Offline Std</option>
          </select>

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
                Name
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Class
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Mode
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Medium
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Gender
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Blood
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Mobile
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Email
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Parent Occupation
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Address
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Course Fees
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Hostel Fees
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Total Fees
              </th>
              <th className="text-left py-3 px-3 font-bold border border-green-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td className="py-5 px-3 text-gray-500 border border-gray-300" colSpan={14}>
                  No students found for the selected filters.
                </td>
              </tr>
            ) : null}

            {filteredStudents.map((student) => (
              <tr key={student.id} className="admin-table-row">
                <td className="py-3 px-3 font-medium text-gray-800 border border-gray-300">
                  {student.studentName}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.classId}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs bg-sky-100 text-sky-700">
                    {student.learningMode}
                  </span>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.medium}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700">
                    {student.gender}
                  </span>
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.bloodGroup}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.mobileNumber}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.email}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.parentOccupation}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  {student.address}
                </td>
                <td className="py-3 px-3 font-medium border border-gray-300">
                  {formatCurrency(student.courseFees)}
                </td>
                <td className="py-3 px-3 font-medium border border-gray-300">
                  {formatCurrency(student.hostelFees)}
                </td>
                <td className="py-3 px-3 font-medium border border-gray-300">
                  {formatCurrency(student.courseFees + student.hostelFees)}
                </td>
                <td className="py-3 px-3 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(student)} className="admin-action-icon-btn is-edit" aria-label="Edit student" title="Edit">
                      <img src="/edit.svg" alt="" className="admin-action-icon" />
                    </button>
                    <button type="button" onClick={() => onDelete(student)} disabled={actionLoadingId === student.id} className="admin-action-icon-btn is-delete" aria-label="Delete student" title={actionLoadingId === student.id ? "Deleting" : "Delete"}>
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

export default StudentTable;

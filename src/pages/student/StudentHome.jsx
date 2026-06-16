import { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import StudentTable from "../../components/student/StudentTable";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "../../services/studentService";

const initialForm = {
  StudentName: "",
  LearningMode: "",
  Medium: "",
  Gender: "",
  BloodGroup: "",
  MobileNumber: "",
  Email: "",
  ParentOccupation: "",
  Address: "",
  CourseFees: "",
  HostelFees: "",
  ClassId: "",
};

const normalizeStudyMode = (value) => {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (raw === "ONLINE") return "ONLINE";
  if (raw === "OFFLINE") return "OFFLINE";
  return "";
};

const normalizeMedium = (value) => {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (raw === "ENGLISH" || raw === "ENGLISH MEDIUM") return "ENGLISH";
  if (raw === "TAMIL" || raw === "TAMIL MEDIUM") return "TAMIL";
  return "";
};

const StudentHome = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
      setError(error.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const openAddModal = () => {
    clearForm();
    setError("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    clearForm();
    setIsFormModalOpen(false);
  };

  const buildPayload = () => ({
    StudentName: form.StudentName.trim(),
    StudyMode: normalizeStudyMode(form.LearningMode),
    Medium: normalizeMedium(form.Medium),
    IsOnline: form.LearningMode.toLowerCase() === "online" ? 1 : 0,
    Gender: form.Gender.trim(),
    BloodGroup: form.BloodGroup.trim(),
    MobileNumber: form.MobileNumber.trim(),
    Email: form.Email.trim(),
    ParentOccupation: form.ParentOccupation.trim(),
    Address: form.Address.trim(),
    CourseFees: Number(form.CourseFees || 0),
    HostelFees: Number(form.HostelFees || 0),
    ClassId: Number(form.ClassId || 0),
    IsActive: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = buildPayload();
      if (editingId) {
        await updateStudent(editingId, payload);
      } else {
        await createStudent(payload);
      }
      clearForm();
      setIsFormModalOpen(false);
      await fetchStudents();
    } catch (err) {
      console.error("Error saving student:", err);
      setError(err.message || "Failed to save student.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      StudentName: student.studentName || "",
      LearningMode: normalizeStudyMode(student.learningMode),
      Medium: normalizeMedium(student.medium),
      Gender: student.gender || "",
      BloodGroup: student.bloodGroup || "",
      MobileNumber: student.mobileNumber || "",
      Email: student.email || "",
      ParentOccupation: student.parentOccupation || "",
      Address: student.address || "",
      CourseFees: String(student.courseFees ?? ""),
      HostelFees: String(student.hostelFees ?? ""),
      ClassId: String(student.classId ?? ""),
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const confirmDelete = async (student) => {
    if (!student?.id) return;
    setError("");
    setActionLoadingId(student.id);
    try {
      await deleteStudent(student.id);
      if (editingId === student.id) {
        clearForm();
      }
      await fetchStudents();
      setConfirmDeleteStudent(null);
    } catch (err) {
      console.error("Error deleting student:", err);
      setError(err.message || "Failed to delete student.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalStudents = students.length;
  const boys = students.filter(
    (s) => String(s?.Gender || "").toLowerCase() === "male",
  ).length;
  const girls = students.filter(
    (s) => String(s?.Gender || "").toLowerCase() === "female",
  ).length;
  const activeStudents = students.filter((s) =>
    Boolean(s?.IsActive ?? s?.isActive),
  ).length;
  const totalFees = students.reduce(
    (sum, s) =>
      sum +
      Number(s?.CourseFees ?? s?.courseFees ?? 0) +
      Number(s?.HostelFees ?? s?.hostelFees ?? 0),
    0,
  );

  return (
    <div className="p-6 admin-page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-950">
          Students
        </h1>
        <button type="button" onClick={openAddModal} className="admin-primary-btn">
          Add Student
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Students" value={totalStudents} tone="emerald" delay={0} />
        <StatCard title="Boys" value={boys} tone="cyan" delay={70} />
        <StatCard title="Girls" value={girls} tone="violet" delay={140} />
        <StatCard title="Active" value={activeStudents} tone="slate" delay={210} />
        <StatCard title="Fees Collected" value={new Intl.NumberFormat("en-IN").format(totalFees)} tone="amber" delay={280} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading students...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <StudentTable students={students} onEdit={handleEdit} onDelete={student => setConfirmDeleteStudent(student)} actionLoadingId={actionLoadingId} />
      ) : null}

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className={`admin-card admin-modal-panel rounded-2xl p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${editingId ? "admin-edit-mode" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {editingId ? "Edit Student" : "Add Student"}
              </h2>
              <button type="button" onClick={closeFormModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Student Name" value={form.StudentName} onChange={e => handleInputChange("StudentName", e.target.value)} className="admin-input" required />
              <select value={form.LearningMode} onChange={e => handleInputChange("LearningMode", e.target.value)} className="admin-input" required>
                <option value="">Select Mode</option>
                <option value="ONLINE">Online Std</option>
                <option value="OFFLINE">Offline Std</option>
              </select>
              <select value={form.Medium} onChange={e => handleInputChange("Medium", e.target.value)} className="admin-input" required>
                <option value="">Select Medium</option>
                <option value="ENGLISH">English Medium</option>
                <option value="TAMIL">Tamil Medium</option>
              </select>
              <input type="text" placeholder="Gender" value={form.Gender} onChange={e => handleInputChange("Gender", e.target.value)} className="admin-input" required />
              <input type="text" placeholder="Blood Group" value={form.BloodGroup} onChange={e => handleInputChange("BloodGroup", e.target.value)} className="admin-input" />
              <input type="text" placeholder="Mobile Number" value={form.MobileNumber} onChange={e => handleInputChange("MobileNumber", e.target.value)} className="admin-input" required />
              <input type="email" placeholder="Email" value={form.Email} onChange={e => handleInputChange("Email", e.target.value)} className="admin-input" />
              <input type="text" placeholder="Parent Occupation" value={form.ParentOccupation} onChange={e => handleInputChange("ParentOccupation", e.target.value)} className="admin-input" />
              <input type="text" placeholder="Address" value={form.Address} onChange={e => handleInputChange("Address", e.target.value)} className="admin-input" />
              <input type="number" min="0" placeholder="Course Fees" value={form.CourseFees} onChange={e => handleInputChange("CourseFees", e.target.value)} className="admin-input" />
              <input type="number" min="0" placeholder="Hostel Fees" value={form.HostelFees} onChange={e => handleInputChange("HostelFees", e.target.value)} className="admin-input" />
              <input type="number" min="1" placeholder="Class Id" value={form.ClassId} onChange={e => handleInputChange("ClassId", e.target.value)} className="admin-input" required />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Student"
                    : "Add Student"}
              </button>
              <button type="button" onClick={closeFormModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDeleteStudent ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Student
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete student "
              {confirmDeleteStudent.studentName}"?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteStudent(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => confirmDelete(confirmDeleteStudent)} disabled={actionLoadingId === confirmDeleteStudent.id}>
                {actionLoadingId === confirmDeleteStudent.id
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentHome;

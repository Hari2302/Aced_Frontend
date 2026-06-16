import { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import TeacherTable from "../../components/teacher/TeacherTable";
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher,
} from "../../services/teacherService";
import { getClasses } from "../../services/classService";

const initialForm = {
  TeacherName: "",
  Email: "",
  PhoneNumber: "",
  Subject: "",
  ClassId: "",
  BloodGroup: "",
  Address: "",
  Salary: "",
  IsSalaryCredited: false,
};

const TeacherHome = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classNameById, setClassNameById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [salaryToggleLoadingId, setSalaryToggleLoadingId] = useState(null);
  const [confirmDeleteTeacher, setConfirmDeleteTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      const [teacherData, classData] = await Promise.all([
        getTeachers(),
        getClasses(),
      ]);
      setTeachers(teacherData);
      setClasses(classData);
      const classMap = classData.reduce((acc, item) => {
        const id = item?.Id ?? item?.id;
        const name = item?.ClassName ?? item?.className;
        if (id !== undefined && name) acc[String(id)] = name;
        return acc;
      }, {});
      setClassNameById(classMap);
    } catch (err) {
      console.error("Error loading teachers:", err);
      setError(err.message || "Failed to load teachers.");
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
    TeacherName: form.TeacherName.trim(),
    Email: form.Email.trim(),
    PhoneNumber: form.PhoneNumber.trim(),
    Subject: form.Subject.trim(),
    ClassId: Number(form.ClassId || 0),
    BloodGroup: form.BloodGroup.trim(),
    Address: form.Address.trim(),
    Salary: Number(form.Salary || 0),
    IsSalaryCredited: form.IsSalaryCredited ? 1 : 0,
    IsActive: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await updateTeacher(editingId, payload);
      } else {
        await createTeacher(payload);
      }
      clearForm();
      setIsFormModalOpen(false);
      await fetchTeachers();
    } catch (err) {
      console.error("Error saving teacher:", err);
      setError(err.message || "Failed to save teacher.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setForm({
      TeacherName: teacher.teacherName || "",
      Email: teacher.email || "",
      PhoneNumber: teacher.phoneNumber || "",
      Subject: teacher.subject || "",
      ClassId: String(teacher.classId || ""),
      BloodGroup: teacher.bloodGroup || "",
      Address: teacher.address || "",
      Salary: String(teacher.salary ?? ""),
      IsSalaryCredited: Boolean(teacher.isSalaryCredited),
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const confirmDelete = async (teacher) => {
    if (!teacher?.id) return;
    setError("");
    setActionLoadingId(teacher.id);
    try {
      await deleteTeacher(teacher.id);
      if (editingId === teacher.id) {
        clearForm();
      }
      await fetchTeachers();
      setConfirmDeleteTeacher(null);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      setError(err.message || "Failed to delete teacher.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSalary = async (teacher) => {
    setError("");
    setSalaryToggleLoadingId(teacher.id);
    try {
      await updateTeacher(teacher.id, {
        IsSalaryCredited: teacher.isSalaryCredited ? 0 : 1,
      });
      await fetchTeachers();
    } catch (err) {
      console.error("Error updating salary credited status:", err);
      setError(err.message || "Failed to update salary credited status.");
    } finally {
      setSalaryToggleLoadingId(null);
    }
  };

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) =>
    Boolean(t?.IsActive ?? t?.isActive),
  ).length;
  const salaryCredited = teachers.filter((t) =>
    Boolean(t?.IsSalaryCredited ?? t?.isSalaryCredited),
  ).length;
  const monthlyPayroll = teachers.reduce(
    (sum, t) => sum + Number(t?.Salary ?? t?.salary ?? 0),
    0,
  );

  return (
    <div className="p-6 admin-page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-950">
          Teachers
        </h1>
        <button type="button" onClick={openAddModal} className="admin-primary-btn">
          Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Teachers" value={totalTeachers} tone="emerald" delay={0} />
        <StatCard title="Active" value={activeTeachers} tone="cyan" delay={70} />
        <StatCard title="Salary Credited" value={salaryCredited} tone="violet" delay={140} />
        <StatCard title="Monthly Payroll" value={new Intl.NumberFormat("en-IN").format(monthlyPayroll)} tone="amber" delay={210} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading teachers...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <TeacherTable teachers={teachers} classNameById={classNameById} onEdit={handleEdit} onDelete={teacher => setConfirmDeleteTeacher(teacher)} onToggleSalary={handleToggleSalary} actionLoadingId={actionLoadingId} salaryToggleLoadingId={salaryToggleLoadingId} />
      ) : null}

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className={`admin-card admin-modal-panel rounded-2xl p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${editingId ? "admin-edit-mode" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {editingId ? "Edit Teacher" : "Add Teacher"}
              </h2>
              <button type="button" onClick={closeFormModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Teacher Name" value={form.TeacherName} onChange={e => handleInputChange("TeacherName", e.target.value)} className="admin-input" required />
              <input type="email" placeholder="Email" value={form.Email} onChange={e => handleInputChange("Email", e.target.value)} className="admin-input" required />
              <input type="text" placeholder="Phone Number" value={form.PhoneNumber} onChange={e => handleInputChange("PhoneNumber", e.target.value)} className="admin-input" required />
              <input type="text" placeholder="Subject" value={form.Subject} onChange={e => handleInputChange("Subject", e.target.value)} className="admin-input" required />
              <select value={form.ClassId} onChange={e => handleInputChange("ClassId", e.target.value)} className="admin-input" required>
                <option value="">Select Class</option>
                {classes.map((item) => {
                  const id = item?.Id ?? item?.id;
                  const name = item?.ClassName ?? item?.className;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <input type="text" placeholder="Blood Group" value={form.BloodGroup} onChange={e => handleInputChange("BloodGroup", e.target.value)} className="admin-input" />
              <input type="text" placeholder="Address" value={form.Address} onChange={e => handleInputChange("Address", e.target.value)} className="admin-input" />
              <input type="number" min="0" placeholder="Salary" value={form.Salary} onChange={e => handleInputChange("Salary", e.target.value)} className="admin-input" required />
              <label className="inline-flex items-center gap-2 text-sm border border-gray-200 bg-white rounded-lg px-3 py-2">
                <input type="checkbox" checked={form.IsSalaryCredited} onChange={e => handleInputChange("IsSalaryCredited", e.target.checked)} />
                Salary Credited
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Teacher"
                    : "Add Teacher"}
              </button>
              <button type="button" onClick={closeFormModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDeleteTeacher ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Teacher
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete teacher "
              {confirmDeleteTeacher.teacherName}"?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteTeacher(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => confirmDelete(confirmDeleteTeacher)} disabled={actionLoadingId === confirmDeleteTeacher.id}>
                {actionLoadingId === confirmDeleteTeacher.id
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

export default TeacherHome;

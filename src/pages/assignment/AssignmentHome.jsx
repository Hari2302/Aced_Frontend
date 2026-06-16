import { useEffect, useState } from "react";
import AssignmentTable from "../../components/assignment/AssignmentTable";
import StatCard from "../../components/dashboard/StatCard";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  updateAssignment,
} from "../../services/assignmentService";
import { getClasses } from "../../services/classService";
import { getTeachers } from "../../services/teacherService";

const initialForm = {
  Title: "",
  Description: "",
  ClassId: "",
  AssignedByTeacherId: "",
  DeadlineDate: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const AssignmentHome = () => {
  const [assignments, setAssignments] = useState([]);
  const [classNameById, setClassNameById] = useState({});
  const [teacherNameById, setTeacherNameById] = useState({});
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmDeleteAssignment, setConfirmDeleteAssignment] = useState(null);

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentData, classData, teacherData] = await Promise.all([
        getAssignments(),
        getClasses(),
        getTeachers(),
      ]);

      setAssignments(assignmentData);
      setClasses(classData);
      setTeachers(teacherData);

      const classMap = classData.reduce((acc, item) => {
        const id = item?.Id ?? item?.id;
        const name = item?.ClassName ?? item?.className;
        if (id !== undefined && name) acc[String(id)] = name;
        return acc;
      }, {});
      setClassNameById(classMap);

      const teacherMap = teacherData.reduce((acc, item) => {
        const id = item?.Id ?? item?.id;
        const name = item?.TeacherName ?? item?.teacherName;
        if (id !== undefined && name) acc[String(id)] = name;
        return acc;
      }, {});
      setTeacherNameById(teacherMap);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setError(err.message || "Failed to load assignments.");
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
    Title: form.Title.trim(),
    Description: form.Description.trim(),
    ClassId: Number(form.ClassId || 0),
    AssignedByTeacherId: Number(form.AssignedByTeacherId || 0),
    DeadlineDate: form.DeadlineDate,
    IsActive: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await updateAssignment(editingId, payload);
      } else {
        await createAssignment(payload);
      }
      clearForm();
      setIsFormModalOpen(false);
      await fetchAssignmentData();
    } catch (err) {
      console.error("Error saving assignment:", err);
      setError(err.message || "Failed to save assignment.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setForm({
      Title: assignment.title || "",
      Description: assignment.description || "",
      ClassId: String(assignment.classId ?? ""),
      AssignedByTeacherId: String(assignment.assignedByTeacherId ?? ""),
      DeadlineDate: toDateInput(assignment.deadlineDate),
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const confirmDelete = async (assignment) => {
    if (!assignment?.id) return;
    setError("");
    setActionLoadingId(assignment.id);
    try {
      await deleteAssignment(assignment.id);
      if (editingId === assignment.id) {
        clearForm();
      }
      await fetchAssignmentData();
      setConfirmDeleteAssignment(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError(err.message || "Failed to delete assignment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) =>
    Boolean(a?.IsActive ?? a?.isActive),
  ).length;
  const dueSoonCount = assignments.filter((a) => {
    const dateValue =
      a?.DeadlineDate || a?.deadlineDate || a?.DueDate || a?.dueDate;
    if (!dateValue) return false;
    const dueDate = new Date(dateValue);
    if (Number.isNaN(dueDate.getTime())) return false;
    const now = new Date();
    const diffDays = Math.ceil(
      (dueDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) /
        (24 * 60 * 60 * 1000),
    );
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <div className="p-6 admin-page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-950">
          Assignments
        </h1>
        <button type="button" onClick={openAddModal} className="admin-primary-btn">
          Add Assignment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Assignments" value={totalAssignments} tone="emerald" delay={0} />
        <StatCard title="Active" value={activeAssignments} tone="cyan" delay={70} />
        <StatCard title="Inactive" value={totalAssignments - activeAssignments} tone="slate" delay={140} />
        <StatCard title="Due in 7 Days" value={dueSoonCount} tone="amber" delay={210} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading assignments...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <AssignmentTable assignments={assignments} classNameById={classNameById} teacherNameById={teacherNameById} onEdit={handleEdit} onDelete={assignment => setConfirmDeleteAssignment(assignment)} actionLoadingId={actionLoadingId} />
      ) : null}

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className={`admin-card admin-modal-panel rounded-2xl p-5 w-full max-w-5xl max-h-[90vh] overflow-y-auto ${editingId ? "admin-edit-mode" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {editingId ? "Edit Assignment" : "Add Assignment"}
              </h2>
              <button type="button" onClick={closeFormModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" placeholder="Title" value={form.Title} onChange={e => handleInputChange("Title", e.target.value)} className="admin-input" required />
              <textarea placeholder="Description" value={form.Description} onChange={e => handleInputChange("Description", e.target.value)} className="admin-input md:col-span-4 min-h-28" required />
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
              <select value={form.AssignedByTeacherId} onChange={e => handleInputChange("AssignedByTeacherId", e.target.value)} className="admin-input" required>
                <option value="">Select Teacher</option>
                {teachers.map((item) => {
                  const id = item?.Id ?? item?.id;
                  const name = item?.TeacherName ?? item?.teacherName;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <input type="date" value={form.DeadlineDate} onChange={e => handleInputChange("DeadlineDate", e.target.value)} className="admin-input" required />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Assignment"
                    : "Add Assignment"}
              </button>
              <button type="button" onClick={closeFormModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDeleteAssignment ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Assignment
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete assignment "
              {confirmDeleteAssignment.title}"?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteAssignment(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => confirmDelete(confirmDeleteAssignment)} disabled={actionLoadingId === confirmDeleteAssignment.id}>
                {actionLoadingId === confirmDeleteAssignment.id
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

export default AssignmentHome;

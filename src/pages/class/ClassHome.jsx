import { useEffect, useState } from "react";
import ClassTable from "../../components/class/ClassTable";
import StatCard from "../../components/dashboard/StatCard";
import {
  createClass,
  deleteClass,
  getClasses,
  updateClass,
} from "../../services/classService";

const initialForm = {
  ClassName: "",
  Section: "",
};

const ClassHome = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error("Error loading classes:", err);
      setError(err.message || "Failed to load classes.");
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
    ClassName: form.ClassName.trim(),
    Section: form.Section.trim(),
    IsActive: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await updateClass(editingId, payload);
      } else {
        await createClass(payload);
      }
      clearForm();
      setIsFormModalOpen(false);
      await fetchClasses();
    } catch (err) {
      console.error("Error saving class:", err);
      setError(err.message || "Failed to save class.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (classItem) => {
    setEditingId(classItem.id);
    setForm({
      ClassName: classItem.className || "",
      Section: classItem.section || "",
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const confirmDelete = async (classItem) => {
    if (!classItem?.id) return;
    setError("");
    setActionLoadingId(classItem.id);
    try {
      await deleteClass(classItem.id);
      if (editingId === classItem.id) {
        clearForm();
      }
      await fetchClasses();
      setConfirmDeleteClass(null);
    } catch (err) {
      console.error("Error deleting class:", err);
      setError(err.message || "Failed to delete class.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) =>
    Boolean(c?.IsActive ?? c?.isActive),
  ).length;
  const inactiveClasses = totalClasses - activeClasses;
  const uniqueSections = new Set(
    classes.map((c) => c?.Section || c?.section).filter(Boolean),
  ).size;

  return (
    <div className="p-6 admin-page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-950">
          Classes
        </h1>
        <button type="button" onClick={openAddModal} className="admin-primary-btn">
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Classes" value={totalClasses} tone="emerald" delay={0} />
        <StatCard title="Active" value={activeClasses} tone="cyan" delay={70} />
        <StatCard title="Inactive" value={inactiveClasses} tone="slate" delay={140} />
        <StatCard title="Sections" value={uniqueSections} tone="violet" delay={210} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading classes...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <ClassTable classes={classes} onEdit={handleEdit} onDelete={classItem => setConfirmDeleteClass(classItem)} actionLoadingId={actionLoadingId} />
      ) : null}

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className={`admin-card admin-modal-panel rounded-2xl p-5 w-full max-w-xl ${editingId ? "admin-edit-mode" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {editingId ? "Edit Class" : "Add Class"}
              </h2>
              <button type="button" onClick={closeFormModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Class Name" value={form.ClassName} onChange={e => handleInputChange("ClassName", e.target.value)} className="admin-input" required />
              <input type="text" placeholder="Section" value={form.Section} onChange={e => handleInputChange("Section", e.target.value)} className="admin-input" required />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Class"
                    : "Add Class"}
              </button>
              <button type="button" onClick={closeFormModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDeleteClass ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Class
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete class "
              {confirmDeleteClass.className}"?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteClass(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => confirmDelete(confirmDeleteClass)} disabled={actionLoadingId === confirmDeleteClass.id}>
                {actionLoadingId === confirmDeleteClass.id
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

export default ClassHome;

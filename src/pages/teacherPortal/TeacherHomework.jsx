import { useState } from "react";
import {
  createTeacherAssignment,
  deleteTeacherAssignment,
  updateTeacherAssignment,
} from "../../services/teacherPortalService";
import { useTeacherPortalData } from "./useTeacherPortalData";

const getDateTime = (value) => {
  const time = new Date(value || "").getTime();
  return Number.isNaN(time) ? 0 : time;
};

const HighlightDate = ({ value }) => (
  <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-semibold text-green-900 ring-1 ring-green-300">
    {String(value || "").slice(0, 10) || "-"}
  </span>
);

const TeacherHomework = () => {
  const { data, loading, error, reload, setError } = useTeacherPortalData();
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadlineDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const normalizedTitle = String(form.title || "").trim();
      const payload = {
        title: normalizedTitle.toLowerCase().startsWith("hw -")
          ? normalizedTitle
          : `HW - ${normalizedTitle}`,
        description: form.description,
        deadlineDate: form.deadlineDate,
      };
      if (editingId) {
        await updateTeacherAssignment(editingId, payload);
      } else {
        await createTeacherAssignment(payload);
      }
      setForm({ title: "", description: "", deadlineDate: "" });
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err.message || "Failed to save homework");
    } finally {
      setSaving(false);
    }
  };

  const homeworks = (data?.assignments || [])
    .filter((a) =>
      String(a?.Title || "")
        .toLowerCase()
        .startsWith("hw -"),
    )
    .sort(
      (a, b) =>
        getDateTime(b.DeadlineDate || b.DueDate) -
        getDateTime(a.DeadlineDate || a.DueDate),
    );

  const startEdit = (assignment) => {
    const title = String(assignment.Title || "");
    const cleanedTitle = title.toLowerCase().startsWith("hw -")
      ? title.slice(4).trim()
      : title;
    setEditingId(assignment.Id);
    setForm({
      title: cleanedTitle,
      description: assignment.Description || "",
      deadlineDate: String(
        assignment.DeadlineDate || assignment.DueDate || "",
      ).slice(0, 10),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", deadlineDate: "" });
    setError("");
  };

  const handleDelete = async (assignment) => {
    if (!assignment?.Id) return;
    try {
      setDeletingId(assignment.Id);
      setError("");
      await deleteTeacherAssignment(assignment.Id);
      if (editingId === assignment.Id) {
        cancelEdit();
      }
      await reload();
    } catch (err) {
      setError(err.message || "Failed to delete homework");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page-enter">
      <div className="space-y-6">
        <form className={`admin-card p-5 md:p-6 ${editingId ? "admin-edit-mode" : ""}`} onSubmit={submit}>
          <div className="mb-5">
            <h1 className="admin-title text-2xl font-bold text-emerald-900">
              {editingId ? "Edit Homework" : "Create Homework"}
            </h1>
            {/* <p className="text-sm text-slate-600 mt-1">Publish homework with a clear title, detailed description, and deadline date.</p> */}
          </div>
          <input className="admin-input mb-3" placeholder="Homework title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          <textarea className="admin-input mb-3 min-h-28" placeholder="Homework description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          <input className="admin-input mb-3" type="date" value={form.deadlineDate} onChange={e => setForm(p => ({ ...p, deadlineDate: e.target.value }))} required />
          <button className="admin-primary-btn" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Homework"
                : "Create Homework"}
          </button>
          {editingId ? (
            <button className="admin-secondary-btn ml-2" type="button" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          ) : null}
          {error ? <p className="text-sm text-red-700 mt-3">{error}</p> : null}
        </form>

        <div className="admin-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="admin-title text-lg font-semibold text-gray-800">
              Homework Records
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              All active homework items published for your assigned class.
            </p>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {loading ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-slate-500">Loading...</div>
            ) : null}
            {!loading && homeworks.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-slate-500">No homework found.</div>
            ) : null}
            {!loading
              ? homeworks.map((a) => (
                  <article key={a.Id} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="break-words text-base font-bold text-slate-900">{a.Title || "-"}</h3>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{a.Description || "-"}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <HighlightDate value={a.DeadlineDate || a.DueDate} />
                      <div className="flex items-center gap-2">
                        <button type="button" className="admin-action-icon-btn is-edit" onClick={() => startEdit(a)} aria-label="Edit homework" title="Edit">
                          <img src="/edit.svg" alt="" className="admin-action-icon" />
                        </button>
                        <button type="button" className="admin-action-icon-btn is-delete" onClick={() => handleDelete(a)} disabled={deletingId === a.Id} aria-label="Delete homework" title={deletingId === a.Id ? "Deleting" : "Delete"}>
                          <img src="/delete.svg" alt="" className="admin-action-icon" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              : null}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm border-collapse">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Title
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Description
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Deadline Date
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                ) : null}
                {!loading && homeworks.length === 0 ? (
                  <tr>
                    <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={4}>
                      No homework found.
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? homeworks.map((a) => (
                      <tr key={a.Id} className="admin-table-row">
                        <td className="py-2 px-3 border border-gray-300">
                          {a.Title || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 whitespace-pre-wrap break-words">
                          {a.Description || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          <HighlightDate value={a.DeadlineDate || a.DueDate} />
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          <div className="flex items-center gap-2">
                            <button type="button" className="admin-action-icon-btn is-edit" onClick={() => startEdit(a)} aria-label="Edit homework" title="Edit">
                              <img src="/edit.svg" alt="" className="admin-action-icon" />
                            </button>
                            <button type="button" className="admin-action-icon-btn is-delete" onClick={() => handleDelete(a)} disabled={deletingId === a.Id} aria-label="Delete homework" title={deletingId === a.Id ? "Deleting" : "Delete"}>
                              <img src="/delete.svg" alt="" className="admin-action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomework;

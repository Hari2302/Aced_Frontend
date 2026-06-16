import { useEffect, useState } from "react";
import ExamTable from "../../components/exam/ExamTable";
import StatCard from "../../components/dashboard/StatCard";
import {
  createExam,
  deleteExam,
  getExams,
  updateExam,
} from "../../services/examService";
import { getClasses } from "../../services/classService";

const initialForm = {
  ExamName: "",
  ClassId: "",
  ExamDate: "",
  TotalMark: "",
  TimeTakeMinutes: "",
  PdfFile: null,
  ExistingPdfUrl: "",
  OriginalFileName: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read PDF file"));
    reader.readAsDataURL(file);
  });

const ExamHome = () => {
  const [exams, setExams] = useState([]);
  const [classNameById, setClassNameById] = useState({});
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmDeleteExam, setConfirmDeleteExam] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      setError("");
      const [examData, classData] = await Promise.all([
        getExams(),
        getClasses(),
      ]);
      setExams(examData);
      setClasses(classData);

      const classMap = classData.reduce((acc, item) => {
        const id = item?.Id ?? item?.id;
        const name = item?.ClassName ?? item?.className;
        if (id !== undefined && name) acc[String(id)] = name;
        return acc;
      }, {});
      setClassNameById(classMap);
    } catch (err) {
      console.error("Error loading exams:", err);
      setError(err.message || "Failed to load exams.");
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

  const buildPayload = async () => {
    const payload = {
      ExamName: form.ExamName.trim(),
      ClassId: Number(form.ClassId || 0),
      ExamDate: form.ExamDate,
      TotalMark: Number(form.TotalMark || 0),
      TimeTakeMinutes: Number(form.TimeTakeMinutes || 0),
      IsActive: 1,
    };

    if (form.PdfFile) {
      payload.pdfBase64 = await fileToDataUrl(form.PdfFile);
      payload.originalFileName = form.PdfFile.name;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = await buildPayload();
      if (editingId) {
        await updateExam(editingId, payload);
      } else {
        await createExam(payload);
      }
      clearForm();
      setIsFormModalOpen(false);
      await fetchExamData();
    } catch (err) {
      console.error("Error saving exam:", err);
      setError(err.message || "Failed to save exam.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      ExamName: exam.examName || "",
      ClassId: String(exam.classId ?? ""),
      ExamDate: toDateInput(exam.examDate),
      TotalMark: String(exam.totalMark ?? ""),
      TimeTakeMinutes: String(exam.timeTakeMinutes ?? ""),
      PdfFile: null,
      ExistingPdfUrl: exam.pdfUrl || "",
      OriginalFileName: exam.originalFileName || "",
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const confirmDelete = async (exam) => {
    if (!exam?.id) return;
    setError("");
    setActionLoadingId(exam.id);
    try {
      await deleteExam(exam.id);
      if (editingId === exam.id) {
        clearForm();
      }
      await fetchExamData();
      setConfirmDeleteExam(null);
    } catch (err) {
      console.error("Error deleting exam:", err);
      setError(err.message || "Failed to delete exam.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const buildPdfLink = (pdfUrl) => {
    const baseUrl = String(import.meta.env.VITE_API_URL || "").replace(
      /\/+$/,
      "",
    );
    const relative = String(pdfUrl || "");
    if (!relative) return "";
    if (relative.startsWith("http://") || relative.startsWith("https://"))
      return relative;
    if (relative.startsWith("/")) return `${baseUrl}${relative}`;
    return `${baseUrl}/${relative}`;
  };

  const handleViewPdf = (exam) => {
    const url = buildPdfLink(exam?.pdfUrl);
    if (!url) return;
    setViewerUrl(url);
    setViewerTitle(exam?.examName || "Exam PDF");
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerTitle("");
  };

  const totalExams = exams.length;
  const activeExams = exams.filter((e) =>
    Boolean(e?.IsActive ?? e?.isActive),
  ).length;
  const upcomingExams = exams.filter((e) => {
    const examDate = e?.ExamDate || e?.examDate;
    if (!examDate) return false;
    const parsed = new Date(examDate);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed >= new Date();
  }).length;

  return (
    <div className="p-6 admin-page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-950">
          Exams
        </h1>
        <button type="button" onClick={openAddModal} className="admin-primary-btn">
          Add Exam
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Exams" value={totalExams} tone="emerald" delay={0} />
        <StatCard title="Active" value={activeExams} tone="cyan" delay={70} />
        <StatCard title="Inactive" value={totalExams - activeExams} tone="slate" delay={140} />
        <StatCard title="Upcoming" value={upcomingExams} tone="violet" delay={210} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading exams...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <ExamTable exams={exams} classNameById={classNameById} onEdit={handleEdit} onDelete={exam => setConfirmDeleteExam(exam)} onViewPdf={handleViewPdf} actionLoadingId={actionLoadingId} />
      ) : null}

      {viewerOpen ? (
        <div className="fixed inset-0 z-100 bg-black/55 backdrop-blur-sm  ">
          <div className="admin-card w-full max-w-5xl h-[88vh] p-3 md:p-4 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {viewerTitle || "Exam PDF Viewer"}
              </h2>
              <button type="button" onClick={closeViewer} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
            {viewerUrl ? (
              <iframe title="Admin Exam PDF Viewer" src={`${viewerUrl}#toolbar=0&navpanes=0&scrollbar=1`} className="w-full flex-1 rounded-lg border border-slate-200" />
            ) : (
              <p className="text-sm text-red-600">PDF not available.</p>
            )}
          </div>
        </div>
      ) : null}

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className={`admin-card admin-modal-panel rounded-2xl p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${editingId ? "admin-edit-mode" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {editingId ? "Edit Exam" : "Add Exam"}
              </h2>
              <button type="button" onClick={closeFormModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Exam Name" value={form.ExamName} onChange={e => handleInputChange("ExamName", e.target.value)} className="admin-input" required />
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
              <input type="date" value={form.ExamDate} onChange={e => handleInputChange("ExamDate", e.target.value)} className="admin-input" required />
              <input type="number" min="1" placeholder="Total Mark" value={form.TotalMark} onChange={e => handleInputChange("TotalMark", e.target.value)} className="admin-input" required />
              <input type="number" min="1" placeholder="Time Take (Minutes)" value={form.TimeTakeMinutes} onChange={e => handleInputChange("TimeTakeMinutes", e.target.value)} className="admin-input" required />
              <input id="exam-pdf-upload" type="file" accept="application/pdf" onChange={e => handleInputChange("PdfFile", e.target.files?.[0] || null)} className="admin-input" required={!editingId} />
              {form.ExistingPdfUrl ? (
                <p className="text-xs text-slate-600 md:col-span-3">
                  Existing PDF: {form.OriginalFileName || "Uploaded file"}{" "}
                  (upload new file to replace)
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving ? "Saving..." : editingId ? "Update Exam" : "Add Exam"}
              </button>
              <button type="button" onClick={closeFormModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDeleteExam ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Exam
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete exam "{confirmDeleteExam.examName}
              "?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteExam(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => confirmDelete(confirmDeleteExam)} disabled={actionLoadingId === confirmDeleteExam.id}>
                {actionLoadingId === confirmDeleteExam.id
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

export default ExamHome;

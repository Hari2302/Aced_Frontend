import { Fragment, useMemo, useState } from "react";
import {
  createTeacherTest,
  deleteTeacherTest,
  getTeacherTestAttempts,
  gradeTeacherTestAttempt,
  updateTeacherTest,
} from "../../services/teacherPortalService";
import { useTeacherPortalData } from "./useTeacherPortalData";

const formatTimeForEdit = (value) => {
  if (!value) return "";
  const raw = String(value);
  const timePart = raw.includes("T")
    ? raw.split("T")[1]?.slice(0, 8)
    : raw.slice(0, 8);
  const match = String(timePart || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${minutes} ${period}`;
};

const formatTimeForDisplay = (value) => formatTimeForEdit(value) || "-";

const getDateTime = (value) => {
  const time = new Date(value || "").getTime();
  return Number.isNaN(time) ? 0 : time;
};

const HighlightDate = ({ value }) => (
  <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-semibold text-green-900 ring-1 ring-green-300">
    {String(value || "").slice(0, 10) || "-"}
  </span>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const TeacherTests = () => {
  const { data, loading, error, reload, setError } = useTeacherPortalData();
  const [saving, setSaving] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [questionPreview, setQuestionPreview] = useState(null);
  const [attemptReview, setAttemptReview] = useState(null);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptError, setAttemptError] = useState("");
  const [gradingId, setGradingId] = useState(null);
  const [gradeForms, setGradeForms] = useState({});
  const [attemptSearch, setAttemptSearch] = useState("");
  const [attemptFilter, setAttemptFilter] = useState("all");
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [submittedPdfViewer, setSubmittedPdfViewer] = useState(null);
  const [submittedPdfUrl, setSubmittedPdfUrl] = useState("");
  const [submittedPdfLoading, setSubmittedPdfLoading] = useState(false);
  const [submittedPdfError, setSubmittedPdfError] = useState("");
  const [form, setForm] = useState({
    examName: "",
    portion: "",
    examDate: "",
    timeTakeMinutes: "",
    startTime: "",
    endTime: "",
    totalMark: "",
    questionsText: "",
    questions: [],
    pdfFile: null,
    existingPdfUrl: "",
    originalFileName: "",
  });

  const createEmptyQuestion = () => ({
    questionText: "",
    questionType: "mcq",
    marks: 1,
    options: ["", ""],
    correctOption: "",
  });

  const resetForm = () => {
    setForm({
      examName: "",
      portion: "",
      examDate: "",
      timeTakeMinutes: "",
      startTime: "",
      endTime: "",
      totalMark: "",
      questionsText: "",
      questions: [],
      pdfFile: null,
      existingPdfUrl: "",
      originalFileName: "",
    });
    setEditingId(null);
  };

  // const addQuestion = () =>
  //   setForm((prev) => ({
  //     ...prev,
  //     questions: [...(prev.questions || []), createEmptyQuestion()],
  //   }));

  const removeQuestion = (index) =>
    setForm((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((_, idx) => idx !== index),
    }));

  const updateQuestionField = (index, field, value) =>
    setForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      const question = { ...nextQuestions[index] };
      question[field] = value;
      if (field === "questionType") {
        if (value !== "mcq") {
          question.options = ["", ""];
          question.correctOption = "";
        } else {
          question.options = question.options.length
            ? question.options
            : ["", ""];
        }
      }
      nextQuestions[index] = question;
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const updateQuestionOption = (questionIndex, optionIndex, value) =>
    setForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      const question = { ...nextQuestions[questionIndex] };
      const nextOptions = [...(question.options || [])];
      nextOptions[optionIndex] = value;
      question.options = nextOptions;
      if (question.correctOption && !nextOptions.includes(question.correctOption)) {
        question.correctOption = "";
      }
      nextQuestions[questionIndex] = question;
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const addQuestionOption = (questionIndex) =>
    setForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      const question = { ...nextQuestions[questionIndex] };
      question.options = [...(question.options || []), ""];
      nextQuestions[questionIndex] = question;
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const removeQuestionOption = (questionIndex, optionIndex) =>
    setForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      const question = { ...nextQuestions[questionIndex] };
      const nextOptions = (question.options || []).filter(
        (_, idx) => idx !== optionIndex,
      );
      question.options = nextOptions.length ? nextOptions : ["", ""];
      if (question.correctOption && !nextOptions.includes(question.correctOption)) {
        question.correctOption = "";
      }
      nextQuestions[questionIndex] = question;
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const parseQuestionsText = (questionsText) =>
    String(questionsText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((questionText) => ({
        ...createEmptyQuestion(),
        questionText: questionText.replace(/^\d+\.\s*/, ""),
      }));

  const openCreateModal = () => {
    resetForm();
    setError("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    resetForm();
    setError("");
    setIsFormModalOpen(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        examName: form.examName,
        portion: form.portion,
        examDate: form.examDate,
        startTime: form.startTime,
        endTime: form.endTime,
        totalMark: Number(form.totalMark || 0),
        timeTakeMinutes: Number(form.timeTakeMinutes || 0),
      };

      if (Array.isArray(form.questions) && form.questions.length > 0) {
        payload.questions = form.questions.map((question, index) => ({
          questionText: question.questionText || "",
          sortOrder: Number(question.sortOrder || index + 1),
          marks: Number(question.marks || 1),
          questionType: question.questionType || "text",
          options: Array.isArray(question.options)
            ? question.options.filter(Boolean)
            : [],
          correctOption: String(question.correctOption || "").trim() || null,
        }));
      } else if (String(form.questionsText || "").trim()) {
        payload.questionsText = form.questionsText;
      }

      if (form.pdfFile) {
        payload.pdfBase64 = await fileToDataUrl(form.pdfFile);
        payload.originalFileName = form.pdfFile.name;
      }

      if (editingId) {
        await updateTeacherTest(editingId, payload);
      } else {
        await createTeacherTest(payload);
      }
      resetForm();
      setIsFormModalOpen(false);
      await reload();
    } catch (err) {
      setError(err.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (test) => {
    setEditingId(test.Id);
    setForm({
      examName: test.ExamName || "",
      portion: test.Portion || "",
      examDate: String(test.ExamDate || "").slice(0, 10),
      timeTakeMinutes: String(test.TimeTakeMinutes || ""),
      startTime: formatTimeForEdit(test.StartTime),
      endTime: formatTimeForEdit(test.EndTime),
      totalMark: String(test.TotalMark || ""),
      questionsText: String(test.QuestionsText || ""),
      questions: parseQuestionsText(test.QuestionsText || ""),
      pdfFile: null,
      existingPdfUrl: test.PdfUrl || "",
      originalFileName: test.OriginalFileName || "",
    });
    setError("");
    setIsFormModalOpen(true);
  };

  const handleDelete = async (test) => {
    if (!test?.Id) return;
    try {
      setDeletingId(test.Id);
      setError("");
      await deleteTeacherTest(test.Id);
      if (editingId === test.Id) {
        closeFormModal();
      }
      await reload();
    } catch (err) {
      setError(err.message || "Failed to delete test");
    } finally {
      setDeletingId(null);
    }
  };

  const getQuestionCount = (test) => {
    const count = Number(test?.QuestionCount || 0);
    if (count > 0) return count;
    return String(test?.QuestionsText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;
  };

  const tests = (data?.tests || [])
    .slice()
    .sort((a, b) => getDateTime(b.ExamDate) - getDateTime(a.ExamDate));

  const openAttemptReview = async (test) => {
    try {
      setAttemptReview({ exam: test, attempts: [] });
      setAttemptLoading(true);
      setAttemptError("");
      setAttemptSearch("");
      setAttemptFilter("all");
      setExpandedAttemptId(null);
      const result = await getTeacherTestAttempts(test.Id);
      const nextForms = {};
      (result?.attempts || []).forEach((attempt) => {
        nextForms[attempt.Id] = {
          markAwarded: attempt.MarkAwarded ?? "",
          teacherFeedback: attempt.TeacherFeedback || "",
        };
      });
      setGradeForms(nextForms);
      setAttemptReview(result);
    } catch (err) {
      setAttemptError(err.message || "Failed to load student attempts");
    } finally {
      setAttemptLoading(false);
    }
  };

  const saveGrade = async (attempt) => {
    if (!attempt?.Id) return;
    const payload = gradeForms[attempt.Id] || {};
    try {
      setGradingId(attempt.Id);
      setAttemptError("");
      await gradeTeacherTestAttempt({
        examId: attemptReview.exam.Id,
        attemptId: attempt.Id,
        payload,
      });
      await openAttemptReview(attemptReview.exam);
    } catch (err) {
      setAttemptError(err.message || "Failed to save mark");
    } finally {
      setGradingId(null);
    }
  };

  const closeSubmittedPdfViewer = () => {
    setSubmittedPdfViewer(null);
    setSubmittedPdfError("");
    if (submittedPdfUrl) URL.revokeObjectURL(submittedPdfUrl);
    setSubmittedPdfUrl("");
  };

  const openSubmittedPdf = async (attempt) => {
    if (!attempt?.Id || !attemptReview?.exam?.Id) return;

    const token = localStorage.getItem("token");
    const baseUrl = String(import.meta.env.VITE_API_URL || "").replace(
      /\/+$/,
      "",
    );
    const endpoint = `${baseUrl}/api/teacher-portal/tests/${attemptReview.exam.Id}/attempts/${attempt.Id}/pdf`;

    try {
      setSubmittedPdfViewer(attempt);
      setSubmittedPdfLoading(true);
      setSubmittedPdfError("");
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        let message = "Unable to load submitted PDF";
        try {
          const body = await response.json();
          message = body?.message || message;
        } catch (err) { 
          // ignore parse errors
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      if (submittedPdfUrl) URL.revokeObjectURL(submittedPdfUrl);
      setSubmittedPdfUrl(nextUrl);
    } catch (err) {
      setSubmittedPdfError(err.message || "Unable to load submitted PDF");
    } finally {
      setSubmittedPdfLoading(false);
    }
  };

  const attemptStats = useMemo(() => {
    const rows = attemptReview?.attempts || [];
    const total = rows.length;
    const attended = rows.filter((attempt) => attempt.Id).length;
    const marked = rows.filter(
      (attempt) => attempt.Id && attempt.GradedDate,
    ).length;
    return {
      total,
      attended,
      pendingSubmission: total - attended,
      pendingMark: attended - marked,
      marked,
    };
  }, [attemptReview]);

  const filteredAttempts = useMemo(() => {
    const query = attemptSearch.trim().toLowerCase();
    return (attemptReview?.attempts || []).filter((attempt) => {
      const submitted = Boolean(attempt.Id);
      const marked = Boolean(attempt.GradedDate);
      const matchesFilter =
        attemptFilter === "all" ||
        (attemptFilter === "submitted" && submitted) ||
        (attemptFilter === "notSubmitted" && !submitted) ||
        (attemptFilter === "marked" && marked) ||
        (attemptFilter === "pendingMark" && submitted && !marked);
      const matchesSearch =
        !query ||
        String(attempt.StudentName || "")
          .toLowerCase()
          .includes(query) ||
        String(attempt.Email || "")
          .toLowerCase()
          .includes(query) ||
        String(attempt.MobileNumber || "")
          .toLowerCase()
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [attemptFilter, attemptReview, attemptSearch]);

  return (
    <div className="admin-page-enter">
      <div className="space-y-6">
        <div className="admin-card p-0 overflow-hidden">
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-emerald-100 bg-linear-to-r from-emerald-50 to-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                Test Records
              </h2>
              {/* <p className="text-sm text-slate-500 mt-1">All active tests created for your assigned class.</p> */}
            </div>
            <button type="button" className="admin-primary-btn" onClick={openCreateModal}>
              Create Test
            </button>
          </div>
          {error ? (
            <p className="mx-5 mt-4 text-sm text-red-700">{error}</p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Test
                  </th>

                  <th className="text-left py-2 px-3 border border-green-900">
                    Portion
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Time
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Duration
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Marks
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Date
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Questions
                  </th>
                  <th className="text-left py-2 px-3 border border-green-900">
                    Attempts
                  </th>
                  {/* <th className="text-left py-2 px-3 border border-green-900">Created</th> */}
                  <th className="text-left py-2 px-3 border border-green-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={9}>
                      Loading...
                    </td>
                  </tr>
                ) : null}
                {!loading && tests.length === 0 ? (
                  <tr>
                    <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={9}>
                      No tests found.
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? tests.map((t) => (
                      <tr key={t.Id} className="admin-table-row">
                        <td className="py-2 px-3 border border-gray-300">
                          {t.ExamName || "-"}
                        </td>

                        <td className="py-2 px-3 border border-gray-300 min-w-56 whitespace-pre-wrap wrap-break-word">
                          {t.Portion || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                          {formatTimeForDisplay(t.StartTime)} -{" "}
                          {formatTimeForDisplay(t.EndTime)}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                          {t.TimeTakeMinutes ? `${t.TimeTakeMinutes} min` : "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          {t.TotalMark ?? "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          <HighlightDate value={t.ExamDate} />
                        </td>
                        <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                          {getQuestionCount(t) > 0 ? (
                            <button type="button" className="admin-action-icon-btn is-preview gap-1 text-sky-700" onClick={() => setQuestionPreview(t)} aria-label="View questions" title="View questions">
                              <EyeIcon />
                              <span className="text-xs font-bold">
                                {getQuestionCount(t)}
                              </span>
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                          <button type="button" className="admin-action-icon-btn is-preview gap-1 text-sky-700" onClick={() => openAttemptReview(t)} aria-label="View marks" title="View marks">
                            <EyeIcon />
                            <span className="text-xs font-bold">
                              {Number(t.AttemptCount || 0)}
                            </span>
                          </button>
                        </td>
                        {/* <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">{String(t.CreatedDate || "").slice(0, 10) || "-"}</td> */}
                        <td className="py-2 px-3 border border-gray-300">
                          <div className="flex items-center gap-2">
                            <button type="button" className="admin-action-icon-btn is-edit" onClick={() => startEdit(t)} aria-label="Edit test" title={Number(t.AttemptCount || 0)> 0 ? "Cannot edit after student submission" : "Edit"} disabled={Number(t.AttemptCount || 0)> 0}>
                              <img src="/edit.svg" alt="" className="admin-action-icon" />
                            </button>
                            <button type="button" className="admin-action-icon-btn is-delete" onClick={() => handleDelete(t)} disabled={deletingId === t.Id || Number(t.AttemptCount || 0)> 0} aria-label="Delete test" title={Number(t.AttemptCount || 0)> 0 ? "Cannot delete after student submission" : deletingId === t.Id ? "Deleting" : "Delete"}>
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

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50  items-center justify-center bg-black/45 px-4 ">
          <form className={`admin-card w-full max-w-6xl max-h-[88vh] overflow-hidden p-10 ${editingId ? "admin-edit-mode" : ""}`} onSubmit={submit}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h1 className="admin-title text-xl font-bold text-emerald-900">
                {editingId ? "Edit Test" : "Create Test"}
              </h1>
              <button type="button" className="admin-action-icon-btn is-close" onClick={closeFormModal} aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="admin-input md:col-span-2" placeholder="Test Name" value={form.examName} onChange={e => setForm(p => ({ ...p, examName: e.target.value }))} required />
              <input className="admin-input md:col-span-2" placeholder="Portion / Syllabus" value={form.portion} onChange={e => setForm(p => ({ ...p, portion: e.target.value }))} />
              <input className="admin-input" type="date" value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} required />
              <input className="admin-input" type="number" min="1" placeholder="Total Time (Min)" value={form.timeTakeMinutes} onChange={e => setForm(p => ({ ...p, timeTakeMinutes: e.target.value }))} required />
              <input className="admin-input" type="text" placeholder="Start Time (09:30 AM)" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
              <input className="admin-input" type="text" placeholder="End Time (10:30 AM)" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
              <input className="admin-input md:col-span-2" type="number" min="1" placeholder="Total Marks" value={form.totalMark} onChange={e => setForm(p => ({ ...p, totalMark: e.target.value }))} required />
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-semibold text-slate-800">Test PDF</label>
                </div>
                <input className="admin-input" type="file" accept="application/pdf" onChange={e => setForm(p => ({ ...p, pdfFile: e.target.files?.[0] || null }))} required={!editingId && !form.existingPdfUrl} />
                {form.pdfFile ? (
                  <p className="text-xs text-emerald-700">
                    Selected: {form.pdfFile.name}
                  </p>
                ) : form.existingPdfUrl ? (
                  <p className="text-xs text-slate-600">
                    Existing PDF: {form.originalFileName || "Uploaded test PDF"}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Upload the question paper PDF instead of adding questions.
                  </p>
                )}
                {(form.questions || []).length === 0 ? (
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                    Students will open this PDF, mark answers, and submit a saved PDF.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(form.questions || []).map((question, index) => (
                      <div key={`question-${index}`} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="font-semibold text-slate-800">
                            Question {index + 1}
                          </span>
                          <button type="button" className="admin-action-icon-btn" onClick={() => removeQuestion(index)}>
                            Remove
                          </button>
                        </div>
                        <textarea className="admin-input mb-3" rows={3} placeholder="Question text" value={question.questionText} onChange={e => updateQuestionField(index, "questionText", e.target.value)} required />
                        <div className="grid gap-2 md:grid-cols-3">
                          <select className="admin-input" value={question.questionType} onChange={e => updateQuestionField(index, "questionType", e.target.value)}>
                            <option value="mcq">MCQ</option>
                            <option value="text">Text Answer</option>
                          </select>
                          <input className="admin-input" type="number" min="1" placeholder="Marks" value={question.marks} onChange={e => updateQuestionField(index, "marks", Number(e.target.value || 1))} />
                          {question.questionType === "mcq" ? (
                            <select className="admin-input" value={question.correctOption} onChange={e => updateQuestionField(index, "correctOption", e.target.value)}>
                              <option value="">Select correct option</option>
                              {(question.options || []).map((option, optionIndex) => (
                                <option key={`correct-option-${index}-${optionIndex}`} value={option}>
                                  {option || `Option ${optionIndex + 1}`}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="admin-input text-slate-500">
                              Text answer question
                            </div>
                          )}
                        </div>
                        {question.questionType === "mcq" ? (
                          <div className="mt-3 space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={`option-${index}-${optionIndex}`} className="flex gap-2">
                                <input className="admin-input flex-1" type="text" placeholder={`Option ${optionIndex + 1}`} value={option} onChange={e => updateQuestionOption(index, optionIndex, e.target.value)} required />
                                <button type="button" className="admin-action-icon-btn" onClick={() => removeQuestionOption(index, optionIndex)}>
                                  ×
                                </button>
                              </div>
                            ))}
                            <button type="button" className="admin-secondary-btn" onClick={() => addQuestionOption(index)}>
                              Add Option
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {error ? (
              <p className="text-sm text-red-700 mt-3">{error}</p>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Test"
                    : "Create Test"}
              </button>
              <button className="admin-secondary-btn" type="button" onClick={closeFormModal} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {questionPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="admin-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4">
              <div>
                <h3 className="admin-title text-lg font-semibold text-gray-800">
                  Questions
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {questionPreview.ExamName || "Test"} -{" "}
                  {getQuestionCount(questionPreview)} questions
                </p>
              </div>
              <button type="button" className="admin-action-icon-btn is-delete shrink-0" onClick={() => setQuestionPreview(null)} aria-label="Close questions" title="Close">
                x
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto px-5 py-4">
              <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-800">
                {String(questionPreview.QuestionsText || "")
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((question, index) => (
                    <li key={`${questionPreview.Id}-${index}`} className="whitespace-pre-wrap wrap-break-word">
                      {question.replace(/^\d+\.\s*/, "")}
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {attemptReview ? (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-4 h-fit">
          <div className="admin-card mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden p-0">
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4">
              <div>
                <h3 className="admin-title text-lg font-semibold text-gray-800">
                  Student Answers & Marks
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {attemptReview.exam?.ExamName ||
                    attemptReview.exam?.examName ||
                    "Test"}
                </p>
              </div>
              <button type="button" className="admin-action-icon-btn is-delete shrink-0" onClick={() => { setAttemptReview(null); setAttemptError(""); }} aria-label="Close attempts" title="Close">
                x
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
              {attemptLoading ? (
                <p className="text-sm text-slate-600">Loading attempts...</p>
              ) : null}
              {attemptError ? (
                <p className="text-sm text-red-700 mb-3">{attemptError}</p>
              ) : null}
              {!attemptLoading ? (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[
                      [
                        "Students",
                        attemptStats.total,
                        "bg-slate-50 text-slate-800",
                      ],
                      [
                        "Attended",
                        attemptStats.attended,
                        "bg-green-50 text-green-800",
                      ],
                      [
                        "Not Attended",
                        attemptStats.pendingSubmission,
                        "bg-red-50 text-red-800",
                      ],
                      [
                        "Marked",
                        attemptStats.marked,
                        "bg-emerald-50 text-emerald-800",
                      ],
                      [
                        "Pending Mark",
                        attemptStats.pendingMark,
                        "bg-amber-50 text-amber-800",
                      ],
                    ].map(([label, value, tone]) => (
                      <div key={label} className={`rounded-md border border-slate-200 p-3 ${tone}`}>
                        <p className="text-xs font-semibold uppercase">
                          {label}
                        </p>
                        <p className="admin-title mt-1 text-2xl font-bold">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
                    <input className="admin-input" placeholder="Search student, email, or mobile" value={attemptSearch} onChange={e => setAttemptSearch(e.target.value)} />
                    <select className="admin-input" value={attemptFilter} onChange={e => setAttemptFilter(e.target.value)}>
                      <option value="all">All students</option>
                      <option value="submitted">Submitted</option>
                      <option value="notSubmitted">Not attended</option>
                      <option value="marked">Marked</option>
                      <option value="pendingMark">Pending mark</option>
                    </select>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="admin-table-head">
                        <tr>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Student
                          </th>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Submitted
                          </th>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Answers
                          </th>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Mark
                          </th>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Status
                          </th>
                          <th className="text-left py-2 px-3 border border-green-900">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttempts.length === 0 ? (
                          <tr>
                            <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={6}>
                              No students found for this filter.
                            </td>
                          </tr>
                        ) : null}
                        {filteredAttempts.map((attempt) => {
                          const isExpanded =
                            expandedAttemptId === attempt.StudentId;
                          const submitted = Boolean(attempt.Id);
                          return (
                            <Fragment key={attempt.StudentId}>
                              <tr className="admin-table-row">
                                <td className="py-2 px-3 border border-gray-300">
                                  <p className="font-semibold text-slate-900">
                                    {attempt.StudentName || "Student"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {attempt.MobileNumber ||
                                      attempt.Email ||
                                      "-"}
                                  </p>
                                </td>
                                <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                                  {submitted
                                    ? String(attempt.AttemptedDate || "")
                                        .slice(0, 19)
                                        .replace("T", " ")
                                    : "-"}
                                </td>
                                <td className="py-2 px-3 border border-gray-300">
                                  {submitted
                                    ? attempt.AttemptedCount || 0
                                    : "-"}
                                </td>
                                <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                                  {attempt.GradedDate
                                    ? `${attempt.MarkAwarded ?? "-"} / ${attemptReview.exam?.TotalMark ?? "-"}`
                                    : submitted
                                      ? "Pending"
                                      : "-"}
                                </td>
                                <td className="py-2 px-3 border border-gray-300">
                                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${!submitted ? "bg-red-100 text-red-700" : attempt.GradedDate ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                                    {!submitted
                                      ? "Not attended"
                                      : attempt.GradedDate
                                        ? "Marked"
                                        : "Pending mark"}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border border-gray-300">
                                  {submitted ? (
                                    <div className="flex items-center gap-2">
                                      {attempt.SubmittedPdfPath ||
                                      attempt.SubmittedPdfUrl ? (
                                        <button type="button" className="admin-action-icon-btn is-preview" onClick={() => openSubmittedPdf(attempt)} aria-label="View submitted PDF" title="View submitted PDF">
                                          <EyeIcon />
                                        </button>
                                      ) : null}
                                      <button type="button" className="admin-action-icon-btn is-edit" onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.StudentId)} aria-label={isExpanded ? "Hide review" : "Review"} title={isExpanded ? "Hide review" : "Review"}>
                                        {isExpanded ? "−" : "+"}
                                      </button>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                              {isExpanded ? (
                                <tr key={`${attempt.StudentId}-review`}>
                                  <td className="py-3 px-3 border border-gray-300 bg-slate-50" colSpan={6}>
                                    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                                      <div className="space-y-2">
                                        {(attempt.answers || []).map(
                                          (answer, index) => (
                                            <div key={`${attempt.Id}-${index}`} className="rounded-md bg-white p-3 border border-slate-200">
                                              <p className="whitespace-pre-wrap wrap-break-word text-sm font-semibold text-slate-900 bg-amber-100">
                                                {answer.sortOrder || index + 1}.{" "}
                                                {answer.questionText ||
                                                  "Question text not available"}
                                              </p>
                                              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-slate-800">
                                                <span className="font-semibold  text-teal-600">
                                                  Ans :{" "}
                                                </span>
                                                {answer.answerText || "-"}
                                              </p>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      <div className="rounded-md bg-white p-3 border border-slate-200">
                                        <label className="text-sm font-semibold text-slate-700">
                                          Mark
                                          <input className="admin-input mt-1" type="number" min="0" max={attemptReview.exam?.TotalMark || attemptReview.exam?.totalMark || undefined} step="0.5" value={gradeForms[attempt.Id]?.markAwarded ?? ""} onChange={e => setGradeForms(prev => ({ ...prev, [attempt.Id]: { ...(prev[attempt.Id] || {}), markAwarded: e.target.value } }))} />
                                        </label>
                                        <label className="mt-3 block text-sm font-semibold text-slate-700">
                                          Feedback
                                          <textarea className="admin-input mt-1 min-h-24" placeholder="Optional feedback" value={gradeForms[attempt.Id]?.teacherFeedback ?? ""} onChange={e => setGradeForms(prev => ({ ...prev, [attempt.Id]: { ...(prev[attempt.Id] || {}), teacherFeedback: e.target.value } }))} />
                                        </label>
                                        <button type="button" className="admin-primary-btn mt-3 w-full" onClick={() => saveGrade(attempt)} disabled={gradingId === attempt.Id}>
                                          {gradingId === attempt.Id
                                            ? "Saving..."
                                            : "Save Mark"}
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {submittedPdfViewer ? (
        <div className="fixed inset-0 z-[60] bg-black/55 p-3">
          <div className="admin-card h-[90vh] w-full max-w-5xl p-3 md:p-4 flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Submitted PDF
                </h2>
                <p className="text-sm text-slate-500">
                  {submittedPdfViewer.StudentName || "Student"}
                </p>
              </div>
              <button type="button" className="admin-action-icon-btn is-close" onClick={closeSubmittedPdfViewer} aria-label="Close submitted PDF" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            {submittedPdfLoading ? (
              <p className="text-sm text-slate-600">Loading submitted PDF...</p>
            ) : null}
            {submittedPdfError ? (
              <p className="text-sm text-red-600">{submittedPdfError}</p>
            ) : null}
            {!submittedPdfLoading && !submittedPdfError && submittedPdfUrl ? (
              <iframe title="Teacher Submitted PDF Viewer" src={`${submittedPdfUrl}#toolbar=1&navpanes=0&scrollbar=1`} className="w-full flex-1 rounded-lg border border-slate-200" />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherTests;

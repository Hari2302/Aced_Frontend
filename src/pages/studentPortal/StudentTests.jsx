import { useEffect, useMemo, useState } from "react";
import { useStudentPortalData } from "../../hooks/useStudentPortalData";
import { getStudentToken } from "../../services/studentPortalAuth";
import {
  getPendingStudentExamAttemptIds,
  getStudentExamQuestions,
  syncPendingStudentExamAttempts,
  submitStudentExamAttempt,
} from "../../services/studentPortalService";
import PdfMarker from "../../components/pdf/PdfMarker";
import { formatDate } from "./studentPortalUtils";

const bytesToBase64DataUrl = (bytes) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return `data:application/pdf;base64,${btoa(binary)}`;
};

const AttemptIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 5h8M8 9h8M8 13h5M6 19l3-1 8-8a2.1 2.1 0 0 0-3-3l-8 8-1 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PdfIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 3v5h4M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StudentTests = () => {
  const { loading, error, data } = useStudentPortalData();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState("");
  const [attemptOpen, setAttemptOpen] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptSubmitting, setAttemptSubmitting] = useState(false);
  const [attemptError, setAttemptError] = useState("");
  const [attemptSuccess, setAttemptSuccess] = useState("");
  const [attemptExam, setAttemptExam] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);
  const [attemptAnswers, setAttemptAnswers] = useState({});
  const [attemptPdfBytes, setAttemptPdfBytes] = useState(null);
  const [markedPdfBase64, setMarkedPdfBase64] = useState("");
  const [submittedExamIds, setSubmittedExamIds] = useState(() =>
    getPendingStudentExamAttemptIds(),
  );
  const [markPreview, setMarkPreview] = useState(null);

  const rows = useMemo(
    () => {
      const exams = Array.isArray(data?.exams) ? data.exams : [];
      return exams.map((item) => ({
        id: item.Id || item.id,
        examName: item.ExamName || item.examName || "-",
        className:
          item.ClassName || item.className || data?.student?.ClassName || "-",
        totalMark: Number(item.TotalMark ?? item.totalMark ?? 0),
        timeTakeMinutes: Number(
          item.TimeTakeMinutes ?? item.timeTakeMinutes ?? 0,
        ),
        examDate: item.ExamDate || item.examDate || null,
        pdfUrl: item.PdfUrl || item.pdfUrl || "",
        isActive: Boolean(item.IsActive ?? item.isActive ?? true),
        attemptId: item.AttemptId || item.attemptId || null,
        attemptedDate: item.AttemptedDate || item.attemptedDate || null,
        submittedPdfUrl: item.SubmittedPdfUrl || item.submittedPdfUrl || "",
        markAwarded: item.MarkAwarded ?? item.markAwarded ?? null,
        teacherFeedback: item.TeacherFeedback || item.teacherFeedback || "",
        gradedDate: item.GradedDate || item.gradedDate || null,
        isSubmitted: Boolean(
          item.AttemptId ||
          item.attemptId ||
          submittedExamIds.includes(item.Id || item.id),
        ),
      }));
    },
    [data?.exams, data?.student?.ClassName, submittedExamIds],
  );

  useEffect(() => {
    return () => {
      if (viewerUrl) URL.revokeObjectURL(viewerUrl);
    };
  }, [viewerUrl]);

  useEffect(() => {
    const token = getStudentToken();
    if (!token) return undefined;

    const syncPending = async () => {
      const synced = await syncPendingStudentExamAttempts(token);
      if (synced.length === 0) return;
      setSubmittedExamIds((prev) => {
        const next = new Set(prev);
        synced.forEach((item) => {
          if (item.examId) next.add(Number(item.examId));
        });
        return Array.from(next);
      });
    };

    syncPending();
    window.addEventListener("online", syncPending);
    const timer = window.setInterval(syncPending, 30000);

    return () => {
      window.removeEventListener("online", syncPending);
      window.clearInterval(timer);
    };
  }, []);

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerTitle("");
    setViewerError("");
    if (viewerUrl) URL.revokeObjectURL(viewerUrl);
    setViewerUrl("");
  };

  const handleViewSubmittedPdf = async (examId, examName) => {
    const token = getStudentToken();
    if (!token) {
      setViewerError("Session expired. Please login again.");
      return;
    }

    const baseUrl = String(import.meta.env.VITE_API_URL || "").replace(
      /\/+$/,
      "",
    );
    const endpoint = `${baseUrl}/api/student-portal/exams/${examId}/submitted-pdf`;

    try {
      setViewerLoading(true);
      setViewerError("");
      setViewerTitle(`${examName} - Submitted PDF`);
      setViewerOpen(true);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = "Unable to load submitted PDF";
        try {
          const body = await response.json();
          message = body?.message || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      if (viewerUrl) URL.revokeObjectURL(viewerUrl);
      setViewerUrl(nextUrl);
    } catch (err) {
      setViewerError(err.message || "Unable to load submitted PDF");
    } finally {
      setViewerLoading(false);
    }
  };

  const closeAttempt = () => {
    setAttemptOpen(false);
    setAttemptLoading(false);
    setAttemptSubmitting(false);
    setAttemptError("");
    setAttemptSuccess("");
    setAttemptExam(null);
    setAttemptQuestions([]);
    setAttemptAnswers({});
    setAttemptPdfBytes(null);
    setMarkedPdfBase64("");
  };

  const startAttempt = async (examId) => {
    const token = getStudentToken();
    if (!token) {
      setAttemptError("Session expired. Please login again.");
      return;
    }

    try {
      setAttemptOpen(true);
      setAttemptLoading(true);
      setAttemptError("");
      setAttemptSuccess("");
      const data = await getStudentExamQuestions({ token, examId });
      setAttemptExam(data?.exam || null);
      setAttemptQuestions(Array.isArray(data?.questions) ? data.questions : []);
      setMarkedPdfBase64("");
      setAttemptPdfBytes(null);
      if (data?.exam?.pdfUrl) {
        const baseUrl = String(import.meta.env.VITE_API_URL || "").replace(
          /\/+$/,
          "",
        );
        const response = await fetch(
          `${baseUrl}/api/student-portal/exams/${examId}/pdf`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) throw new Error("Failed to load test PDF");
        setAttemptPdfBytes(await response.arrayBuffer());
      }
      if (data?.lastAttempt) {
        setAttemptSuccess(
          data.lastAttempt.gradedDate
            ? `Already submitted. Mark: ${data.lastAttempt.markAwarded ?? "-"}`
            : "Already submitted. Waiting for teacher mark.",
        );
      }
      const initialAnswers = {};
      (Array.isArray(data?.questions) ? data.questions : []).forEach((q) => {
        initialAnswers[String(q.id)] = "";
      });
      setAttemptAnswers(initialAnswers);
    } catch (err) {
      setAttemptError(err.message || "Failed to load test questions");
    } finally {
      setAttemptLoading(false);
    }
  };

  const submitAttempt = async (e) => {
    e.preventDefault();
    const token = getStudentToken();
    if (!token || !attemptExam?.id) {
      setAttemptError("Session expired. Please login again.");
      return;
    }

    if (attemptSuccess.toLowerCase().includes("already submitted")) {
      setAttemptError("You have already submitted this test.");
      return;
    }

    const payload = attemptQuestions
      .map((q) => ({
        questionId: Number(q.id || 0),
        answerText: String(attemptAnswers[String(q.id)] || "").trim(),
      }))
      .filter((item) => item.answerText);

    if (payload.length === 0 && !markedPdfBase64) {
      setAttemptError("Please mark the PDF before submitting.");
      return;
    }

    try {
      setAttemptSubmitting(true);
      setAttemptError("");
      const result = await submitStudentExamAttempt({
        token,
        examId: attemptExam.id,
        answers: payload,
        markedPdfBase64,
        originalFileName: `${attemptExam.examName || "test"}-marked.pdf`,
      });
      setSubmittedExamIds((prev) =>
        prev.includes(attemptExam.id) ? prev : [...prev, attemptExam.id],
      );
      setMarkedPdfBase64("");
      setAttemptSuccess(
        result?.offline
          ? "Saved locally. It will sync when connection returns."
          : "Already submitted. Waiting for teacher mark.",
      );
    } catch (err) {
      setAttemptError(err.message || "Failed to submit attempt");
    } finally {
      setAttemptSubmitting(false);
    }
  };

  const submitMarkedPdf = async (markedBytes) => {
    const token = getStudentToken();
    if (!token || !attemptExam?.id) {
      setAttemptError("Session expired. Please login again.");
      return;
    }

    if (attemptSuccess.toLowerCase().includes("already submitted")) {
      setAttemptError("You have already submitted this test.");
      return;
    }

    try {
      setAttemptSubmitting(true);
      setAttemptError("");
      const markedPdf = bytesToBase64DataUrl(markedBytes);
      const result = await submitStudentExamAttempt({
        token,
        examId: attemptExam.id,
        answers: [],
        markedPdfBase64: markedPdf,
        originalFileName: `${attemptExam.examName || "test"}-marked.pdf`,
      });
      setMarkedPdfBase64("");
      setSubmittedExamIds((prev) =>
        prev.includes(attemptExam.id) ? prev : [...prev, attemptExam.id],
      );
      setAttemptSuccess(
        result?.offline
          ? "Saved locally. It will sync when connection returns."
          : "Already submitted. Waiting for teacher mark.",
      );
    } catch (err) {
      setAttemptError(err.message || "Failed to submit marked PDF");
    } finally {
      setAttemptSubmitting(false);
    }
  };

  return (
    <main>
      <div className="admin-card p-5 md:p-6 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Exam Section
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          View exams, open PDFs, and attempt test questions.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading exams...</p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="admin-card p-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="admin-table-head">
              <tr>
                <th className="text-left p-2 border border-emerald-900">
                  Exam
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Class
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Exam Date
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Total Mark
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Time (Min)
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Attempt
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Mark
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-2 border border-slate-200 text-slate-500" colSpan={8}>
                    No exams available.
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.id} className="admin-table-row">
                    <td className="p-2 border border-slate-200">
                      {item.examName}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.className}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {formatDate(item.examDate)}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.totalMark}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.timeTakeMinutes}
                    </td>
                    <td className="p-2 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startAttempt(item.id)} className="admin-action-icon-btn is-edit" disabled={item.isSubmitted} aria-label="Attempt test" title={item.isSubmitted ? "Submitted" : "Attempt"}>
                          <AttemptIcon />
                        </button>
                        {item.isSubmitted ? (
                        <button type="button" onClick={() => handleViewSubmittedPdf(item.id, item.examName)} className="admin-action-icon-btn is-preview" aria-label="View submitted PDF" title="View submitted PDF">
                          <PdfIcon />
                        </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.isSubmitted ? (
                        <button type="button" className={`admin-action-icon-btn ${item.gradedDate ? "bg-green-100 border-green-300 text-green-700" : "bg-red-100 border-red-300 text-red-700"}`} onClick={() => setMarkPreview(item)} aria-label="View mark" title={item.gradedDate ? "View mark" : "Mark pending"}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border border-slate-200">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {viewerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm  p-3">
          <div className="admin-card w-full max-w-5xl h-[88vh] p-3 md:p-4 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                {viewerTitle || "PDF Viewer"}
              </h2>
              <button type="button" onClick={closeViewer} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            {viewerLoading ? (
              <p className="text-sm text-slate-600">Opening PDF viewer...</p>
            ) : null}
            {viewerError ? (
              <p className="text-sm text-red-600">{viewerError}</p>
            ) : null}

            {!viewerLoading && !viewerError && viewerUrl ? (
              <iframe title="Student Exam PDF Viewer" src={`${viewerUrl}#toolbar=0&navpanes=0&scrollbar=1`} className="w-full flex-1 rounded-lg border border-slate-200" />
            ) : null}
          </div>
        </div>
      ) : null}

      {attemptOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-3">
          <div className="admin-card w-full max-w-5xl h-[88vh] p-3 md:p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                Attempt Test: {attemptExam?.examName || "Exam"}
              </h2>
              <button type="button" onClick={closeAttempt} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>

            {attemptLoading ? (
              <p className="text-sm text-slate-600">Loading questions...</p>
            ) : null}
            {attemptError ? (
              <p className="text-sm text-red-600 mb-2">{attemptError}</p>
            ) : null}
            {attemptSuccess ? (
              <p className="text-sm text-emerald-700 mb-2">{attemptSuccess}</p>
            ) : null}

            {!attemptLoading && !attemptError ? (
              <form onSubmit={submitAttempt} className="overflow-y-auto space-y-3 pr-1">
                {attemptPdfBytes ? (
                  <PdfMarker pdfBytes={attemptPdfBytes} disabled={attemptSubmitting} onSave={submitMarkedPdf} />
                ) : null}

                {attemptQuestions.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    {attemptPdfBytes
                      ? "Use the PDF above to mark your answers."
                      : "No questions available for this test."}
                  </p>
                ) : (
                  attemptQuestions.map((q, index) => (
                    <div key={`${q.id}-${index}`} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Q{index + 1}. {q.questionText}
                      </p>
                      {q.questionType === "mcq" && Array.isArray(q.options) && q.options.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {q.options.map((option, optionIndex) => (
                            <label key={`${q.id}-option-${optionIndex}`} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                              <input type="radio" name={`question-${q.id}`} value={option} checked={attemptAnswers[String(q.id)] === option} onChange={() => setAttemptAnswers(prev => ({ ...prev, [String(q.id)]: option }))} className="form-radio h-4 w-4 text-emerald-600" />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea className="admin-input mt-2 min-h-20" placeholder="Type your answer" value={attemptAnswers[String(q.id)] || ""} onChange={e => setAttemptAnswers(prev => ({ ...prev, [String(q.id)]: e.target.value }))} />
                      )}
                    </div>
                  ))
                )}

                {attemptQuestions.length > 0 &&
                !attemptSuccess.toLowerCase().includes("already submitted") ? (
                  <button type="submit" className="admin-primary-btn" disabled={attemptSubmitting}>
                    {attemptSubmitting ? "Submitting..." : "Submit Attempt"}
                  </button>
                ) : null}
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {markPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="admin-card w-full max-w-md overflow-hidden p-0">
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4">
              <div>
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Test Mark
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {markPreview.examName}
                </p>
              </div>
              <button type="button" onClick={() => setMarkPreview(null)} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className={`rounded-md p-4 ${markPreview.gradedDate ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-xs font-semibold uppercase ${markPreview.gradedDate ? "text-green-700" : "text-red-700"}`}>
                  {markPreview.gradedDate ? "Marked" : "Pending"}
                </p>
                <p className="admin-title mt-1 text-2xl font-bold text-slate-900">
                  {markPreview.gradedDate
                    ? `${markPreview.markAwarded ?? "-"} / ${markPreview.totalMark}`
                    : "Teacher has not added mark yet"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Feedback</p>
                <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-slate-600">
                  {markPreview.teacherFeedback || "No feedback added yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default StudentTests;

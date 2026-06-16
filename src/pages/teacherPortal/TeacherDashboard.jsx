import { useEffect, useState } from "react";
import {
  createTeacherAssignment,
  createTeacherTest,
  getTeacherDashboard,
} from "../../services/teacherPortalService";

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    deadlineDate: "",
  });
  const [testForm, setTestForm] = useState({
    examName: "",
    portion: "",
    examDate: "",
    timeTakeMinutes: "",
    startTime: "",
    endTime: "",
    totalMark: "",
    questions: [],
  });
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [savingTest, setSavingTest] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getTeacherDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load teacher dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createEmptyQuestion = () => ({
    questionText: "",
    questionType: "mcq",
    marks: 1,
    options: ["", ""],
    correctOption: "",
  });

  const addQuestion = () =>
    setTestForm((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), createEmptyQuestion()],
    }));

  const removeQuestion = (index) =>
    setTestForm((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((_, idx) => idx !== index),
    }));

  const updateQuestionField = (index, field, value) =>
    setTestForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      nextQuestions[index] = {
        ...nextQuestions[index],
        [field]: value,
      };
      if (field === "questionType" && value !== "mcq") {
        nextQuestions[index].options = ["", ""];
        nextQuestions[index].correctOption = "";
      }
      if (field === "questionType" && value === "mcq") {
        nextQuestions[index].options = nextQuestions[index].options.length
          ? nextQuestions[index].options
          : ["", ""];
      }
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const updateQuestionOption = (questionIndex, optionIndex, value) =>
    setTestForm((prev) => {
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
    setTestForm((prev) => {
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
    setTestForm((prev) => {
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

  const updateQuestionCorrectOption = (questionIndex, value) =>
    setTestForm((prev) => {
      const nextQuestions = [...(prev.questions || [])];
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        correctOption: value,
      };
      return {
        ...prev,
        questions: nextQuestions,
      };
    });

  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      setSavingAssignment(true);
      setError("");
      await createTeacherAssignment(assignmentForm);
      setAssignmentForm({ title: "", description: "", deadlineDate: "" });
      await load();
    } catch (err) {
      setError(err.message || "Failed to create assignment");
    } finally {
      setSavingAssignment(false);
    }
  };

  const submitTest = async (e) => {
    e.preventDefault();
    try {
      setSavingTest(true);
      setError("");
      await createTeacherTest({
        ...testForm,
        totalMark: Number(testForm.totalMark || 0),
        timeTakeMinutes: Number(testForm.timeTakeMinutes || 0),
        questions: Array.isArray(testForm.questions)
          ? testForm.questions.map((question) => ({
              questionText: question.questionText || "",
              sortOrder: Number(question.sortOrder || 0),
              marks: Number(question.marks || 1),
              questionType: question.questionType || "text",
              options: Array.isArray(question.options)
                ? question.options.filter(Boolean)
                : [],
              correctOption: String(question.correctOption || "").trim() || null,
            }))
          : [],
      });
      setTestForm({
        examName: "",
        portion: "",
        examDate: "",
        timeTakeMinutes: "",
        startTime: "",
        endTime: "",
        totalMark: "",
        questions: [],
      });
      await load();
    } catch (err) {
      setError(err.message || "Failed to create test");
    } finally {
      setSavingTest(false);
    }
  };

  const assignments = (data?.assignments || []).filter(
    (a) =>
      !String(a?.Title || "")
        .trim()
        .toLowerCase()
        .startsWith("hw -"),
  );

  return (
    <div className="p-6 admin-page-enter">
      <div className="admin-card p-5 md:p-6 mb-6 bg-linear-to-r from-[#0b5d42] via-[#0f8f5c] to-[#17a86f] text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm">Teacher Portal</p>
            <h1 className="admin-title text-2xl font-bold">
              Teacher Dashboard
            </h1>
            <p className="text-emerald-100 text-sm mt-2">
              You can only manage your assigned class records.
            </p>
          </div>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
      {error ? <p className="text-sm text-red-700 mb-4">{error}</p> : null}

      {!loading && data ? (
        <>
          <div className="admin-card p-4 mb-6">
            <p className="text-sm text-slate-600">Teacher</p>
            <h2 className="admin-title text-xl font-bold text-emerald-900">
              {data.teacher?.TeacherName || "-"}
            </h2>
            <p className="text-sm text-slate-700 mt-1">
              Assigned Class: {data.teacher?.ClassName || "-"}{" "}
              {data.teacher?.Section ? `(${data.teacher.Section})` : ""}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <form className="admin-card p-4" onSubmit={submitAssignment}>
              <h3 className="admin-title text-lg font-semibold mb-3">
                Assign Homework / Assignment
              </h3>
              <input className="admin-input mb-3" placeholder="Assignment title" value={assignmentForm.title} onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))} required />
              <textarea className="admin-input mb-3 min-h-24" placeholder="Assignment description" value={assignmentForm.description} onChange={e => setAssignmentForm(p => ({ ...p, description: e.target.value }))} required />
              <input className="admin-input mb-3" type="date" value={assignmentForm.deadlineDate} onChange={e => setAssignmentForm(p => ({ ...p, deadlineDate: e.target.value }))} required />
              <button className="admin-primary-btn" type="submit" disabled={savingAssignment}>
                {savingAssignment ? "Saving..." : "Create Assignment"}
              </button>
            </form>

            <form className="admin-card p-4" onSubmit={submitTest}>
              <h3 className="admin-title text-lg font-semibold mb-3">
                Create Test
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input className="admin-input col-span-2" placeholder="Test Name" value={testForm.examName} onChange={e => setTestForm(p => ({ ...p, examName: e.target.value }))} required />
                <input className="admin-input col-span-2" placeholder="Portion / Syllabus" value={testForm.portion} onChange={e => setTestForm(p => ({ ...p, portion: e.target.value }))} />
                <input className="admin-input" type="date" value={testForm.examDate} onChange={e => setTestForm(p => ({ ...p, examDate: e.target.value }))} required />
                <input className="admin-input" type="number" min="1" placeholder="Total Time (Min)" value={testForm.timeTakeMinutes} onChange={e => setTestForm(p => ({ ...p, timeTakeMinutes: e.target.value }))} required />
                <input className="admin-input" type="text" placeholder="Start Time (09:30 AM)" value={testForm.startTime} onChange={e => setTestForm(p => ({ ...p, startTime: e.target.value }))} />
                <input className="admin-input" type="text" placeholder="End Time (10:30 AM)" value={testForm.endTime} onChange={e => setTestForm(p => ({ ...p, endTime: e.target.value }))} />
                <input className="admin-input col-span-2" type="number" min="1" placeholder="Total Marks" value={testForm.totalMark} onChange={e => setTestForm(p => ({ ...p, totalMark: e.target.value }))} required />
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="admin-title text-base font-semibold">
                    Questions
                  </h4>
                  <button type="button" className="admin-secondary-btn" onClick={addQuestion}>
                    Add Question
                  </button>
                </div>
                {(testForm.questions || []).length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Add questions here. For MCQ choose options and correct answer.
                  </p>
                ) : (
                  testForm.questions.map((question, index) => (
                    <div key={`question-${index}`} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <p className="text-sm font-semibold text-slate-800">
                          Question {index + 1}
                        </p>
                        <button type="button" className="admin-action-icon-btn" onClick={() => removeQuestion(index)}>
                          Remove
                        </button>
                      </div>
                      <textarea className="admin-input mb-3" rows={3} placeholder="Question text" value={question.questionText} onChange={e => updateQuestionField(index, "questionText", e.target.value)} required />
                      <div className="grid grid-cols-3 gap-2">
                        <select className="admin-input" value={question.questionType} onChange={e => updateQuestionField(index, "questionType", e.target.value)}>
                          <option value="mcq">MCQ</option>
                          <option value="text">Text Answer</option>
                        </select>
                        <input className="admin-input" type="number" min="1" placeholder="Marks" value={question.marks} onChange={e => updateQuestionField(index, "marks", Number(e.target.value || 1))} />
                        {question.questionType === "mcq" ? (
                          <select className="admin-input" value={question.correctOption} onChange={e => updateQuestionCorrectOption(index, e.target.value)}>
                            <option value="">Select correct option</option>
                            {(question.options || []).map((option, optionIndex) => (
                              <option key={`correct-${index}-${optionIndex}`} value={option}>
                                {option || `Option ${optionIndex + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-slate-500 px-3 py-2 rounded-md border border-slate-200">
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
                  ))
                )}
              </div>

              <button className="admin-primary-btn mt-3" type="submit" disabled={savingTest}>
                {savingTest ? "Saving..." : "Create Test"}
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="admin-card p-4">
              <h3 className="admin-title text-lg font-semibold mb-2">
                Students ({data.students?.length || 0})
              </h3>
              <ul className="text-sm text-slate-700 space-y-2 max-h-64 overflow-auto">
                {(data.students || []).map((s) => (
                  <li key={s.Id}>
                    {s.StudentName} - {s.MobileNumber || "-"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-card p-4">
              <h3 className="admin-title text-lg font-semibold mb-2">
                Assignments ({assignments.length})
              </h3>
              <ul className="text-sm text-slate-700 space-y-2 max-h-64 overflow-auto">
                {assignments.map((a) => (
                  <li key={a.Id}>
                    {a.Title} -{" "}
                    {String(a.DeadlineDate || a.DueDate || "").slice(0, 10)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-card p-4">
              <h3 className="admin-title text-lg font-semibold mb-2">
                Tests ({data.tests?.length || 0})
              </h3>
              <ul className="text-sm text-slate-700 space-y-2 max-h-64 overflow-auto">
                {(data.tests || []).map((t) => (
                  <li key={t.Id}>
                    {t.ExamName} - {String(t.ExamDate || "").slice(0, 10)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TeacherDashboard;

import { Link } from "react-router-dom";
import { useStudentPortalData } from "../../hooks/useStudentPortalData";
import { getStudentProfile } from "../../services/studentPortalAuth";
import { formatDate } from "./studentPortalUtils";

const StudentsDashboard = () => {
  const { loading, error, data } = useStudentPortalData();
  const student = getStudentProfile();

  const profile = data?.student || {};
  const timetable = Array.isArray(data?.timetable) ? data.timetable : [];
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
  const exams = Array.isArray(data?.exams) ? data.exams : [];
  const homeworkItems = assignments.filter((item) =>
    String(item?.Title || item?.title || "")
      .trim()
      .toLowerCase()
      .startsWith("hw -"),
  );
  const assignmentItems = assignments.filter(
    (item) =>
      !String(item?.Title || item?.title || "")
        .trim()
        .toLowerCase()
        .startsWith("hw -"),
  );

  return (
    <main className="relative">
      <div className="admin-card admin-card-animate p-5 md:p-6 mb-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[#0a3e2f] text-sm m-1">Welcome back</p>
            {/* <h1 className="text-[#0a3e2f] admin-title text-2xl md:text-3xl font-bold mt-1">Students Dashboard</h1> */}
            <h1 className="text-[#0a3e2f] admin-title text-2xl md:text-3xl font-bold mt-1">
              {profile.StudentName || student?.studentName || "Student"} | Class{" "}
              {profile.ClassName || "-"}
            </h1>
          </div>
          <div className="admin-card bg-white/10 border-white/20 text-white px-4 py-3 rounded-xl">
            <p className="text-xs text-[#0a3e2f] uppercase tracking-[0.14em]">
              Mode
            </p>
            <p className="text-[#14a87e] text-lg font-bold">
              {profile.StudyMode || "ONLINE"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">
          Loading your online class dashboard...
        </p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="admin-card p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Timetable
              </p>
              <p className="text-2xl font-bold mt-2 text-emerald-800">
                {timetable.length}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Assignments
              </p>
              <p className="text-2xl font-bold mt-2 text-cyan-800">
                {assignmentItems.length}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Homework
              </p>
              <p className="text-2xl font-bold mt-2 text-sky-800">
                {homeworkItems.length}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Exams
              </p>
              <p className="text-2xl font-bold mt-2 text-violet-800">
                {exams.length}
              </p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Medium
              </p>
              <p className="text-2xl font-bold mt-2 text-amber-800">
                {profile.Medium || "-"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Timetable Section
                </h2>
                <Link className="admin-secondary-btn !py-2 !px-3" to="/student/timetable">
                  Open
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                {timetable.slice(0, 3).map((item) => (
                  <li key={item.Id || item.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">{item.Subject || "-"}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(item.ScheduleDate || item.scheduleDate)}
                    </p>
                  </li>
                ))}
                {timetable.length === 0 ? (
                  <li className="text-slate-500">No timetable records.</li>
                ) : null}
              </ul>
            </div>

            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Student Details Section
                </h2>
                <Link className="admin-secondary-btn !py-2 !px-3" to="/student/details">
                  Open
                </Link>
              </div>
              <p className="text-sm text-slate-700">
                Name: {profile.StudentName || "-"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                Email: {profile.Email || "-"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                Phone: {profile.MobileNumber || "-"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Assignments
                </h2>
              </div>
              <ul className="space-y-2 text-sm">
                {assignmentItems.slice(0, 4).map((item) => (
                  <li key={item.Id || item.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">
                      {item.Title || item.title || "-"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap break-words">
                      {item.Description || item.description || "-"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Deadline:{" "}
                      {formatDate(
                        item.DeadlineDate ||
                          item.deadlineDate ||
                          item.DueDate ||
                          item.dueDate,
                      )}
                    </p>
                  </li>
                ))}
                {assignmentItems.length === 0 ? (
                  <li className="text-slate-500">
                    No assignments assigned yet.
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Homework
                </h2>
              </div>
              <ul className="space-y-2 text-sm">
                {homeworkItems.slice(0, 4).map((item) => (
                  <li key={item.Id || item.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">
                      {item.Title || item.title || "-"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap break-words">
                      {item.Description || item.description || "-"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Deadline:{" "}
                      {formatDate(
                        item.DeadlineDate ||
                          item.deadlineDate ||
                          item.DueDate ||
                          item.dueDate,
                      )}
                    </p>
                  </li>
                ))}
                {homeworkItems.length === 0 ? (
                  <li className="text-slate-500">No homework assigned yet.</li>
                ) : null}
              </ul>
            </div>

            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Video Section
                </h2>
                <Link className="admin-secondary-btn !py-2 !px-3" to="/student/videos">
                  Open
                </Link>
              </div>
              <p className="text-sm text-slate-600">
                Topic-based online class videos are arranged by timetable
                subjects.
              </p>
            </div>

            <div className="admin-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="admin-title text-lg font-semibold text-gray-800">
                  Exam Section
                </h2>
                <Link className="admin-secondary-btn !py-2 !px-3" to="/student/exams">
                  Open
                </Link>
              </div>
              <p className="text-sm text-slate-600">
                View exam details, open uploaded exam PDF, and attempt test
                questions.
              </p>
              <ul className="space-y-2 text-sm mt-4">
                {exams.slice(0, 3).map((item) => (
                  <li key={item.Id || item.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">
                      {item.ExamName || item.examName || "-"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(item.ExamDate || item.examDate)}
                    </p>
                  </li>
                ))}
                {exams.length === 0 ? (
                  <li className="text-slate-500">No tests assigned yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
};

export default StudentsDashboard;

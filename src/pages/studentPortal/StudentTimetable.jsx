import { useState } from "react";
import { useStudentPortalData } from "../../hooks/useStudentPortalData";
import { formatDate, formatTime } from "./studentPortalUtils";

const StudentTimetable = () => {
  const { loading, error, data } = useStudentPortalData();
  const timetable = Array.isArray(data?.timetable) ? data.timetable : [];
  const [previewHtml, setPreviewHtml] = useState("");

  return (
    <main>
      <div className="admin-card p-5 md:p-6 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Timetable Section
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Your class schedule for online learning.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading timetable...</p>
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
                  Date
                </th>
                <th className="text-left p-2 border border-emerald-900">Day</th>
                <th className="text-left p-2 border border-emerald-900">
                  Subject
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Time
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Type
                </th>
                <th className="text-left p-2 border border-emerald-900">
                  Template
                </th>
              </tr>
            </thead>
            <tbody>
              {timetable.length === 0 ? (
                <tr>
                  <td className="p-2 border border-slate-200 text-slate-500" colSpan={6}>
                    No timetable records.
                  </td>
                </tr>
              ) : (
                timetable.map((item) => (
                  <tr key={item.Id || item.id} className="admin-table-row">
                    <td className="p-2 border border-slate-200">
                      {formatDate(item.ScheduleDate || item.scheduleDate)}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.DayOfWeek || item.dayOfWeek || "-"}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.Subject || item.subject || "-"}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {formatTime(item.StartTime || item.startTime)} -{" "}
                      {formatTime(item.EndTime || item.endTime)}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.TestType || item.testType || "-"}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {item.HtmlBody || item.htmlBody ? (
                        <button type="button" className="admin-action-icon-btn is-preview" onClick={() => setPreviewHtml(String(item.HtmlBody || item.htmlBody || ""))} aria-label="Preview timetable" title="Preview">
                          <img src="/preview.svg" alt="" className="admin-action-icon" />
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {previewHtml ? (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="admin-card w-full max-w-6xl h-[88vh] p-3 md:p-4 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="admin-title text-lg font-semibold text-gray-800">
                Timetable Template Preview
              </h2>
              <button type="button" onClick={() => setPreviewHtml("")} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
            <iframe title="Student Timetable Template Preview" srcDoc={previewHtml} className="w-full flex-1 rounded-lg border border-slate-200" />
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default StudentTimetable;

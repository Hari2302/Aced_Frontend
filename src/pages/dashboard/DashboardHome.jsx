import { useEffect, useMemo, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import EmployeesStatus from "../../components/dashboard/EmployeesStatus";
import Calendar from "../../components/dashboard/Calendar";
import Awards from "../../components/dashboard/Awards";
import { getStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { getClasses } from "../../services/classService";
import { getExams } from "../../services/examService";
import { getRecentActivityLogs } from "../../services/activityLogService";
import { useAuth } from "../../hooks/useAuth";
import {
  getAdminSettings,
  subscribeAdminSettings,
} from "../../services/adminSettingsService";

const DashboardHome = () => {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin";
  const [settings, setSettings] = useState(() => getAdminSettings());
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => subscribeAdminSettings(setSettings), []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentData, teacherData, classData, examData, logsData] =
        await Promise.all([
          getStudents(),
          getTeachers(),
          getClasses(),
          getExams(),
          isSuperAdmin ? getRecentActivityLogs(250) : Promise.resolve([]),
        ]);

      setStudents(studentData);
      setTeachers(teacherData);
      setClasses(classData);
      setExams(examData);
      setActivityLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalEmployees = teachers.length;

    const totalRevenue = students.reduce(
      (sum, s) =>
        sum +
        Number(s?.CourseFees ?? s?.courseFees ?? 0) +
        Number(s?.HostelFees ?? s?.hostelFees ?? 0),
      0,
    );

    const activeEmployees = teachers.filter((t) =>
      Boolean(t?.IsActive ?? t?.isActive),
    ).length;

    const activeClasses = classes.filter((c) =>
      Boolean(c?.IsActive ?? c?.isActive),
    ).length;

    return {
      totalStudents,
      totalEmployees,
      totalRevenue,
      totalExams: exams.length,
      activeEmployees,
      activeClasses,
    };
  }, [classes, exams.length, students, teachers]);

  return (
    <main className="relative">
      {settings.showWelcomeBanner ? (
        <div className="admin-card admin-card-animate p-5 md:p-6 mb-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 text-white border-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[#0a3e2f] text-sm">Welcome back</p>
              <h1 className="text-[#0a3e2f] admin-title text-2xl md:text-3xl font-bold mt-1">
                {user?.displayName}
              </h1>
              <p className="text-[#0b503a] text-sm mt-2">
                Live summary of students, staff, classes, and exams.
              </p>
            </div>
            <div className="admin-card bg-white/10 border-white/20 text-white px-4 py-3 rounded-xl">
              <p className="text-xs text-[#0a3e2f] uppercase tracking-[0.14em]">
                Role
              </p>
              <p className="text-[#14a87e] text-lg font-bold">
                {isSuperAdmin ? "SuperAdmin" : "Administrator"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading dashboard...</p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Students" value={stats.totalStudents} tone="emerald" delay={0} />
            <StatCard title="Total Employees" value={stats.totalEmployees} tone="cyan" delay={80} />
            {settings.showRevenueCard ? (
              <StatCard title="Total Revenue" value={new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(stats.totalRevenue)} tone="amber" delay={160} />
            ) : null}
            <StatCard title="Total Exams" value={stats.totalExams} tone="violet" delay={240} />
          </div>

          {settings.showActiveStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatCard title="Active Employees" value={stats.activeEmployees} tone="slate" delay={300} />
              <StatCard title="Active Classes" value={stats.activeClasses} tone="emerald" delay={360} />
            </div>
          ) : null}

          <div className="grid md:grid-cols-3 gap-6">
            <EmployeesStatus active={stats.activeEmployees} total={stats.totalEmployees} />
            {settings.showCalendarWidget ? <Calendar /> : null}
            {settings.showAwardsWidget ? <Awards /> : null}
          </div>

          {isSuperAdmin && settings.showSystemActivity ? (
            <div className="admin-card p-4 mt-6">
              <h2 className="admin-title text-lg font-semibold text-gray-800 mb-3">
                System Activity Logs
              </h2>
              <div className="overflow-x-auto rounded-xl border border-emerald-100">
                <table className="w-full text-sm border-collapse">
                  <thead className="admin-table-head">
                    <tr>
                      <th className="text-left py-2 px-3 border border-green-900">
                        Date
                      </th>
                      <th className="text-left py-2 px-3 border border-green-900">
                        User
                      </th>
                      <th className="text-left py-2 px-3 border border-green-900">
                        Module
                      </th>
                      <th className="text-left py-2 px-3 border border-green-900">
                        Action
                      </th>
                      <th className="text-left py-2 px-3 border border-green-900">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.length === 0 ? (
                      <tr>
                        <td className="py-3 px-3 border border-gray-300 text-slate-500" colSpan={5}>
                          No activity logs found.
                        </td>
                      </tr>
                    ) : null}
                    {activityLogs.map((log) => (
                      <tr key={log.Id} className="admin-table-row">
                        <td className="py-2 px-3 border border-gray-300">
                          {new Date(log.ActionDate).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          {log.UserName || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          {log.Module || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          {log.Action || "-"}
                        </td>
                        <td className="py-2 px-3 border border-gray-300">
                          {log.ReferenceId ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
};

export default DashboardHome;

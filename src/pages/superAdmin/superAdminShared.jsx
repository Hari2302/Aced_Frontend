import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentActivityLogs } from "../../services/activityLogService";
import { getStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { getAdminUsers } from "../../services/adminUserService";

export const roleBadgeClass = {
  student: "bg-sky-100 text-sky-700 border-sky-200",
  teacher: "bg-amber-100 text-amber-700 border-amber-200",
  admin: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const roleTitle = {
  student: "Student Section",
  teacher: "Teacher Section",
  admin: "Admin Section",
};

export const roleDescription = {
  student: "Track learner activity, exam attempts, and portal engagement.",
  teacher:
    "Monitor teacher usage, assignment updates, and test publishing activity.",
  admin: "Review administrative users, operations, and system-level actions.",
};

export const roleCta = {
  student: { to: "/student/login", label: "Open Student Portal" },
  teacher: { to: "/admin/login", label: "Open Teacher Login" },
  admin: { to: "/admin/login", label: "Open Admin Login" },
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeIdentity = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{10,15}$/;

const maskEmail = (value) => {
  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) return "Hidden";
  const safeLocal =
    localPart.length <= 2
      ? `${localPart[0] || "*"}*`
      : `${localPart[0]}***${localPart.slice(-1)}`;
  return `${safeLocal}@${domain}`;
};

const maskPhone = (value) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "Hidden";
  return `${"*".repeat(Math.max(digits.length - 4, 0))}${digits.slice(-4)}`;
};

export const maskSensitiveIdentity = (value) => {
  const actorValue = String(value || "").trim();
  if (!actorValue) return "Unknown user";
  if (emailRegex.test(actorValue)) return maskEmail(actorValue);
  if (phoneRegex.test(actorValue.replace(/\s+/g, "")))
    return maskPhone(actorValue);
  return actorValue;
};

const collectIdentityKeys = (items, fields) => {
  const keys = new Set();

  items.forEach((item) => {
    fields.forEach((field) => {
      const normalized = normalizeIdentity(item?.[field]);
      if (normalized) {
        keys.add(normalized);
      }
    });
  });

  return keys;
};

const buildIdentityDisplayMap = (items, keyFields, nameFields) => {
  const map = new Map();

  items.forEach((item) => {
    const displayName =
      nameFields
        .map((field) => String(item?.[field] || "").trim())
        .find(Boolean) || null;

    if (!displayName) return;

    keyFields.forEach((field) => {
      const normalized = normalizeIdentity(item?.[field]);
      if (normalized) map.set(normalized, displayName);
    });
  });

  return map;
};

const resolveActorDisplayName = ({ actor, actorId, identityMaps }) => {
  const normalizedActor = normalizeIdentity(actor);

  if (normalizedActor) {
    const directMatch =
      identityMaps.studentDisplayMap.get(normalizedActor) ||
      identityMaps.teacherDisplayMap.get(normalizedActor) ||
      identityMaps.adminDisplayMap.get(normalizedActor);
    if (directMatch) return directMatch;
  }

  const normalizedActorId = normalizeIdentity(actorId);
  if (normalizedActorId) {
    const idMatch =
      identityMaps.studentIdDisplayMap.get(normalizedActorId) ||
      identityMaps.teacherIdDisplayMap.get(normalizedActorId) ||
      identityMaps.adminIdDisplayMap.get(normalizedActorId);
    if (idMatch) return idMatch;
  }

  return maskSensitiveIdentity(actor);
};

const resolveAudience = ({
  actor,
  action,
  moduleName,
  role,
  studentKeys,
  teacherKeys,
  adminKeys,
}) => {
  const normalizedActor = normalizeIdentity(actor);
  const normalizedRole = normalizeIdentity(role);
  const upperAction = String(action || "").toUpperCase();
  const upperModule = String(moduleName || "").toUpperCase();

  if (normalizedRole === "student" || normalizedRole === "students")
    return "student";
  if (normalizedRole === "teacher") return "teacher";
  if (normalizedRole === "admin" || normalizedRole === "superadmin")
    return "admin";

  if (normalizedActor && studentKeys.has(normalizedActor)) return "student";
  if (normalizedActor && teacherKeys.has(normalizedActor)) return "teacher";
  if (normalizedActor && adminKeys.has(normalizedActor)) return "admin";

  if (upperAction.startsWith("TEACHER_") || upperModule.includes("TEACHER"))
    return "teacher";
  if (
    upperAction.startsWith("STUDENT_") ||
    upperModule.includes("STUDENT") ||
    upperModule.includes("EXAM_ATTEMPT")
  ) {
    return "student";
  }

  if (
    upperModule === "AUTH" ||
    upperAction === "LOGIN" ||
    upperAction === "RESET_PASSWORD" ||
    upperAction.includes("PASSWORD")
  ) {
    return "admin";
  }

  return "admin";
};

export const normalizeLog = (log, identityMaps) => {
  const action = String(log?.Action || "").trim();
  const moduleName = String(log?.Module || "").trim();
  const actor = String(log?.UserName || "").trim();
  const actorId = log?.ActorId;
  const role = String(log?.Role || "").trim();

  return {
    id: log?.Id,
    role: (role || "-").toLowerCase(),
    actor: resolveActorDisplayName({ actor, actorId, identityMaps }),
    module: moduleName || "SYSTEM",
    action: action || "UNKNOWN_ACTION",
    actionDate: log?.ActionDate,
    referenceId: log?.ReferenceId,
    audience: resolveAudience({
      actor,
      role,
      action,
      moduleName,
      studentKeys: identityMaps.studentKeys,
      teacherKeys: identityMaps.teacherKeys,
      adminKeys: identityMaps.adminKeys,
    }),
  };
};

const buildSectionMetrics = ({ students, teachers, adminUsers, logs }) => {
  const studentLogs = logs.filter((item) => item.audience === "student");
  const teacherLogs = logs.filter((item) => item.audience === "teacher");
  const adminLogs = logs.filter((item) => item.audience === "admin");

  return {
    student: {
      total: students.length,
      active: students.filter((item) =>
        Boolean(item?.IsActive ?? item?.isActive ?? true),
      ).length,
      recentActions: studentLogs.length,
      latestAction: studentLogs[0] || null,
    },
    teacher: {
      total: teachers.length,
      active: teachers.filter((item) =>
        Boolean(item?.IsActive ?? item?.isActive),
      ).length,
      recentActions: teacherLogs.length,
      latestAction: teacherLogs[0] || null,
    },
    admin: {
      total: adminUsers.length,
      active: adminUsers.filter((item) =>
        Boolean(item?.IsActive ?? item?.isActive),
      ).length,
      recentActions: adminLogs.length,
      latestAction: adminLogs[0] || null,
    },
  };
};

export const OverviewCard = ({
  tone,
  eyebrow,
  title,
  total,
  active,
  recentActions,
  latestAction,
  cta,
}) => (
  <section className="admin-card flex flex-col gap-4 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`text-xs uppercase tracking-[0.18em] ${tone}`}>
          {eyebrow}
        </p>
        <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
          {title}
        </h2>
      </div>
      <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
        Read Only
      </span>
    </div>

    <p className="text-sm leading-6 text-slate-600">
      {roleDescription[eyebrow.toLowerCase().split(" ")[0]]}
    </p>

    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Total
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Active
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{active}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Actions
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {recentActions}
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        Latest Action
      </p>
      {latestAction ? (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {latestAction.actor} performed {latestAction.action}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {latestAction.module} | {formatDateTime(latestAction.actionDate)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          No recent actions recorded.
        </p>
      )}
    </div>

    <div>
      <Link to={cta.to} className="admin-secondary-btn inline-block !px-3 !py-2">
        {cta.label}
      </Link>
    </div>
  </section>
);

export const SuperAdminSectionPage = ({
  sectionKey,
  title,
  subtitle,
  rows,
  metrics,
  groupedLogs,
}) => {
  const sectionMetric = metrics[sectionKey];
  const sectionRows = rows || [];

  return (
    <main className="relative">
      <div className="admin-card mb-6 border-none bg-[linear-gradient(135deg,#0f172a_0%,#14532d_52%,#effaf5_52%,#ffffff_100%)] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {roleTitle[sectionKey]}
            </p>
            <h1 className="admin-title mt-2 text-2xl font-bold text-white md:text-3xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">
              {subtitle}
            </p>
          </div>
          <span className={`inline-flex h-fit rounded-full border px-3 py-1 text-xs font-semibold ${roleBadgeClass[sectionKey]}`}>
            Audit Enabled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section>
          <OverviewCard tone={sectionKey === "student" ? "text-sky-600" : sectionKey === "teacher" ? "text-amber-600" : "text-emerald-600"} eyebrow={roleTitle[sectionKey]} title={`${title}summary`} total={sectionMetric.total} active={sectionMetric.active} recentActions={sectionMetric.recentActions} latestAction={sectionMetric.latestAction} cta={roleCta[sectionKey]} />
        </section>

        <section className="admin-card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Recent Actions
          </p>
          <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
            Latest {title.toLowerCase()} activity
          </h2>

          <div className="mt-5 space-y-3">
            {groupedLogs[sectionKey].length === 0 ? (
              <p className="text-sm text-slate-500">No recent actions.</p>
            ) : null}

            {groupedLogs[sectionKey].map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.actor}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.action}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBadgeClass[sectionKey]}`}>
                    {item.module}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(item.actionDate)} | Ref:{" "}
                  {item.referenceId ?? "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-card mt-6 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Directory
            </p>
            <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
              {title} records
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {sectionRows.length} entries
          </span>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="admin-table-head">
              <tr>
                {Object.keys(
                  sectionRows[0] || { Name: "", Contact: "", Status: "" },
                ).map((column) => (
                  <th key={column} className="border border-green-900 px-3 py-2 text-left">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionRows.length === 0 ? (
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-slate-500" colSpan={3}>
                    No records found.
                  </td>
                </tr>
              ) : null}
              {sectionRows.map((row, index) => (
                <tr key={`${sectionKey}-${index}`} className="admin-table-row">
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={`${sectionKey}-${index}-${valueIndex}`} className="border border-gray-300 px-3 py-2">
                      {value || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export const useSuperAdminData = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentData, teacherData, adminData, logData] =
          await Promise.all([
            getStudents(),
            getTeachers(),
            getAdminUsers(),
            getRecentActivityLogs(500, { excludeSuperadmin: true }),
          ]);

        const nextStudents = Array.isArray(studentData) ? studentData : [];
        const nextTeachers = Array.isArray(teacherData) ? teacherData : [];
        const nextAdmins = Array.isArray(adminData) ? adminData : [];

        const identityMaps = {
          studentKeys: collectIdentityKeys(nextStudents, [
            "Id",
            "Email",
            "StudentName",
            "MobileNumber",
            "UserName",
          ]),
          teacherKeys: collectIdentityKeys(nextTeachers, [
            "Id",
            "Email",
            "TeacherName",
            "MobileNumber",
            "UserName",
          ]),
          adminKeys: collectIdentityKeys(nextAdmins, [
            "Id",
            "UserName",
            "FullName",
            "Email",
            "MobileNumber",
            "Role",
          ]),
          studentDisplayMap: buildIdentityDisplayMap(
            nextStudents,
            ["Id", "Email", "StudentName", "MobileNumber", "UserName"],
            ["StudentName", "Name", "UserName", "Email"],
          ),
          teacherDisplayMap: buildIdentityDisplayMap(
            nextTeachers,
            ["Id", "Email", "TeacherName", "MobileNumber", "UserName"],
            ["TeacherName", "Name", "UserName", "Email"],
          ),
          adminDisplayMap: buildIdentityDisplayMap(
            nextAdmins,
            ["Id", "UserName", "FullName", "Name", "Email", "MobileNumber"],
            ["FullName", "Name", "UserName", "Email"],
          ),
          studentIdDisplayMap: buildIdentityDisplayMap(
            nextStudents,
            ["Id"],
            ["StudentName", "Name", "UserName"],
          ),
          teacherIdDisplayMap: buildIdentityDisplayMap(
            nextTeachers,
            ["Id"],
            ["TeacherName", "Name", "UserName"],
          ),
          adminIdDisplayMap: buildIdentityDisplayMap(
            nextAdmins,
            ["Id"],
            ["FullName", "Name", "UserName"],
          ),
        };

        setStudents(nextStudents);
        setTeachers(nextTeachers);
        setAdminUsers(nextAdmins);
        setLogs(
          Array.isArray(logData)
            ? logData.map((item) => normalizeLog(item, identityMaps))
            : [],
        );
      } catch (err) {
        setError(err.message || "Failed to load super admin data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(
    () => buildSectionMetrics({ students, teachers, adminUsers, logs }),
    [students, teachers, adminUsers, logs],
  );

  const groupedLogs = useMemo(
    () => ({
      student: logs.filter((item) => item.audience === "student").slice(0, 8),
      teacher: logs.filter((item) => item.audience === "teacher").slice(0, 8),
      admin: logs.filter((item) => item.audience === "admin").slice(0, 8),
    }),
    [logs],
  );

  return {
    students,
    teachers,
    adminUsers,
    logs,
    loading,
    error,
    metrics,
    groupedLogs,
  };
};

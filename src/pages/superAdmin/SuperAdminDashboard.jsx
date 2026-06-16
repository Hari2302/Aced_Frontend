import { useEffect, useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { getActivityLogsPage } from "../../services/activityLogService";
import StatCard from "../../components/dashboard/StatCard";
import {
  OverviewCard,
  formatDateTime,
  maskSensitiveIdentity,
  roleBadgeClass,
  roleCta,
  roleTitle,
  useSuperAdminData,
} from "./superAdminShared";

const seriesConfig = {
  teacher: { label: "Teacher", color: "#f59e0b" },
  student: { label: "Student", color: "#0ea5e9" },
  admin: { label: "Admin", color: "#10b981" },
};

const sectionActivityTheme = {
  student: {
    accent: "from-sky-500 via-cyan-400 to-teal-300",
    soft: "bg-sky-50",
    border: "border-sky-200/80",
    ring: "ring-sky-100",
    glow: "shadow-[0_20px_50px_-30px_rgba(14,165,233,0.65)]",
  },
  teacher: {
    accent: "from-amber-500 via-orange-400 to-yellow-300",
    soft: "bg-amber-50",
    border: "border-amber-200/80",
    ring: "ring-amber-100",
    glow: "shadow-[0_20px_50px_-30px_rgba(245,158,11,0.7)]",
  },
  admin: {
    accent: "from-emerald-500 via-green-400 to-lime-300",
    soft: "bg-emerald-50",
    border: "border-emerald-200/80",
    ring: "ring-emerald-100",
    glow: "shadow-[0_20px_50px_-30px_rgba(16,185,129,0.7)]",
  },
};

const buildAuditChartData = (logs) => {
  const dayMap = new Map();

  logs.forEach((item) => {
    const date = new Date(item.actionDate);
    if (Number.isNaN(date.getTime())) return;

    const dayKey = date.toISOString().slice(0, 10);
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        dayKey,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        teacher: 0,
        student: 0,
        admin: 0,
      });
    }

    const bucket = dayMap.get(dayKey);
    if (bucket[item.audience] !== undefined) {
      bucket[item.audience] += 1;
    }
  });

  return Array.from(dayMap.values())
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
    .slice(-7);
};

const DrilldownPanel = ({ logs, selection }) => {
  if (!selection) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          Click a teacher, student, or admin bar in the chart to see the exact
          records who took action.
        </p>
      </div>
    );
  }

  const matchingLogs = logs.filter(
    (item) =>
      item.audience === selection.audience &&
      String(item.actionDate || "").slice(0, 10) === selection.dayKey,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfa_100%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Selected Drill Down
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">
            {seriesConfig[selection.audience].label} actions on{" "}
            {selection.label}
          </h3>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBadgeClass[selection.audience]}`}>
          {matchingLogs.length} records
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {matchingLogs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No records found for this chart selection.
          </p>
        ) : null}

        {matchingLogs.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.actor}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.action} in {item.module}
                </p>
              </div>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBadgeClass[item.audience]}`}>
                Ref: {item.referenceId ?? "-"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatDateTime(item.actionDate)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionActivityCard = ({ sectionKey, items }) => {
  const theme = sectionActivityTheme[sectionKey];
  const latestItem = items[0];

  return (
    <article className={`relative overflow-hidden rounded-[28px] border ${theme.border} bg-white p-5 ring-1 ${theme.ring} ${theme.glow}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.soft} text-sm font-black uppercase text-slate-800`}>
            {roleTitle[sectionKey].slice(0, 2)}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Section Monitor
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {roleTitle[sectionKey]}
            </h3>
          </div>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBadgeClass[sectionKey]}`}>
          {items.length} recent
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border border-white/70 ${theme.soft} px-4 py-3`}>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Latest Actor
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">
            {latestItem?.actor ?? "No activity"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Stream Health
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {items.length > 0 ? "Live updates" : "Waiting for events"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
            <p className="text-sm text-slate-500">No recent actions.</p>
          </div>
        ) : null}

        {items.map((item, index) => (
          <div key={item.id} className={`relative overflow-hidden rounded-2xl border border-slate-200 px-4 py-3 ${index === 0 ? "bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#f1f5f9_100%)]" : "bg-slate-50/80"}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-3 w-3 flex-none rounded-full bg-gradient-to-br ${theme.accent}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.actor}
                  </p>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.module}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.action}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(item.actionDate)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

const SuperAdminDashboard = () => {
  const {
    students,
    teachers,
    adminUsers,
    logs,
    loading,
    error,
    metrics,
    groupedLogs,
  } = useSuperAdminData();
  const chartRows = useMemo(() => buildAuditChartData(logs), [logs]);
  const [selection, setSelection] = useState(null);
  const [queryDraft, setQueryDraft] = useState({
    search: "",
    role: "",
    module: "",
    action: "",
    userName: "",
  });
  const [query, setQuery] = useState({
    search: "",
    role: "",
    module: "",
    action: "",
    userName: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const [tableRows, setTableRows] = useState([]);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
  });

  const series = useMemo(
    () => [
      {
        id: "teacher",
        dataKey: "teacher",
        label: "Teacher",
        color: seriesConfig.teacher.color,
      },
      {
        id: "student",
        dataKey: "student",
        label: "Student",
        color: seriesConfig.student.color,
      },
      {
        id: "admin",
        dataKey: "admin",
        label: "Admin",
        color: seriesConfig.admin.color,
      },
    ],
    [],
  );

  useEffect(() => {
    const loadLogsPage = async () => {
      try {
        setTableLoading(true);
        setTableError("");

        const data = await getActivityLogsPage({
          page,
          pageSize,
          search: query.search,
          role: query.role,
          module: query.module,
          action: query.action,
          userName: query.userName,
          excludeSuperadmin: true,
        });

        setTableRows(data.rows);
        setTablePagination(data.pagination);
      } catch (err) {
        setTableError(err.message || "Failed to load activity logs");
        setTableRows([]);
        setTablePagination((previous) => ({
          ...previous,
          total: 0,
          totalPages: 1,
        }));
      } finally {
        setTableLoading(false);
      }
    };

    loadLogsPage();
  }, [page, pageSize, query]);

  const onFilterSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery({
      search: queryDraft.search.trim(),
      role: queryDraft.role.trim(),
      module: queryDraft.module.trim(),
      action: queryDraft.action.trim(),
      userName: queryDraft.userName.trim(),
    });
  };

  const totalFrom =
    tablePagination.total === 0
      ? 0
      : (tablePagination.page - 1) * tablePagination.pageSize + 1;
  const totalTo = Math.min(
    tablePagination.page * tablePagination.pageSize,
    tablePagination.total,
  );

  return (
    <main className="relative">
      <div className="admin-card admin-card-animate mb-6 border-none bg-[linear-gradient(135deg,#0c3b2d_0%,#0f5a42_48%,#d8f2e7_48%,#effaf5_100%)] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Executive Oversight
            </p>
            <h1 className="admin-title mt-2 text-2xl font-bold text-white md:text-3xl">
              Super Admin Control Panel
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">
              Separate oversight pages for students, teachers, and admins, with
              a drill-down audit chart for role-wise action tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-emerald-200/40 bg-white/10 p-3 backdrop-blur-sm">
            <div className="rounded-2xl bg-white/90 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Visible Users
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {students.length + teachers.length + adminUsers.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Audit Events
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {logs.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mb-4 text-sm text-gray-600">
          Loading super admin dashboard...
        </p>
      ) : null}
      {error ? (
        <p className="admin-card mb-4 p-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Students" value={metrics.student.total} tone="cyan" delay={0} />
            <StatCard title="Total Teachers" value={metrics.teacher.total} tone="amber" delay={80} />
            <StatCard title="Total Admins" value={metrics.admin.total} tone="emerald" delay={160} />
            <StatCard title="Audit Events" value={logs.length} tone="slate" delay={240} />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <OverviewCard tone="text-sky-600" eyebrow={roleTitle.student} title="Student oversight" total={metrics.student.total} active={metrics.student.active} recentActions={metrics.student.recentActions} latestAction={metrics.student.latestAction} cta={roleCta.student} />
            <OverviewCard tone="text-amber-600" eyebrow={roleTitle.teacher} title="Teacher oversight" total={metrics.teacher.total} active={metrics.teacher.active} recentActions={metrics.teacher.recentActions} latestAction={metrics.teacher.latestAction} cta={roleCta.teacher} />
            <OverviewCard tone="text-emerald-600" eyebrow={roleTitle.admin} title="Administrative oversight" total={metrics.admin.total} active={metrics.admin.active} recentActions={metrics.admin.recentActions} latestAction={metrics.admin.latestAction} cta={roleCta.admin} />
          </div>

          <div className="mt-6 ">
            <section className="admin-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Audit Timeline
                  </p>
                  <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
                    Role-wise action chart
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Click bars to inspect records
                </span>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfa_100%)] p-4">
                {chartRows.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No activity logs found.
                  </p>
                ) : (
                  <BarChart dataset={chartRows} xAxis={[{ scaleType: "band", dataKey: "label" }]} series={series} height={320} grid={{ horizontal: true }} borderRadius={8} margin={{ top: 20, right: 20, bottom: 30, left: 40 }} onItemClick={(_event, item) => { const selectedRow = chartRows[item.dataIndex]; if (!selectedRow || !item.seriesId) return; setSelection({ audience: String(item.seriesId), dayKey: selectedRow.dayKey, label: selectedRow.label }); }} sx={{ "& .MuiChartsAxis-tickLabel": { fill: "#475569", fontSize: 11 }, "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: "#cbd5e1" } }} />
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {Object.entries(seriesConfig).map(([key, config]) => (
                  <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        {config.label}
                      </p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {logs.filter((item) => item.audience === key).length}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <DrilldownPanel logs={logs} selection={selection} />
              </div>
            </section>

            <section className="admin-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Section Activity
                  </p>
                  <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
                    Recent actions by section
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A cleaner operational feed for student, teacher, and admin
                    actions with faster visual scanning.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["student", "teacher", "admin"].map((sectionKey) => (
                    <div key={sectionKey} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        {roleTitle[sectionKey]}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {groupedLogs[sectionKey].length}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
                {["student", "teacher", "admin"].map((sectionKey) => (
                  <SectionActivityCard key={sectionKey} sectionKey={sectionKey} items={groupedLogs[sectionKey]} />
                ))}
              </div>

              {/* <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-800">Latest audit events</h3>
                  <span className="text-xs text-slate-500">Last 6 events</span>
                </div>

                <div className="mt-4 space-y-3">
                  {timeline.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.actor}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.action} in {item.module}
                          </p>
                        </div>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBadgeClass[item.audience]}`}>
                          {item.audience.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(item.actionDate)} | Ref: {item.referenceId ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div> */}
            </section>
          </div>

          <section className="admin-card mt-6 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Activity Ledger
                </p>
                <h2 className="admin-title mt-2 text-xl font-semibold text-slate-900">
                  All system activity logs
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Full audit stream with filters, pagination, and quick lookup
                  by user, action, and module.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {tablePagination.total} total records
              </span>
            </div>

            <form className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-6" onSubmit={onFilterSubmit}>
              <input className="admin-input !mb-0" placeholder="Search any field" value={queryDraft.search} onChange={event => setQueryDraft(previous => ({ ...previous, search: event.target.value }))} />
              <input className="admin-input !mb-0" placeholder="Role (admin/superadmin/teacher/students)" value={queryDraft.role} onChange={event => setQueryDraft(previous => ({ ...previous, role: event.target.value }))} />
              <input className="admin-input !mb-0" placeholder="Module (e.g. AUTH)" value={queryDraft.module} onChange={event => setQueryDraft(previous => ({ ...previous, module: event.target.value }))} />
              <input className="admin-input !mb-0" placeholder="Action (e.g. LOGIN)" value={queryDraft.action} onChange={event => setQueryDraft(previous => ({ ...previous, action: event.target.value }))} />
              <input className="admin-input !mb-0" placeholder="User name" value={queryDraft.userName} onChange={event => setQueryDraft(previous => ({ ...previous, userName: event.target.value }))} />
              <div className="flex gap-2">
                <button type="submit" className="admin-btn flex-1 !px-3 !py-2">
                  Apply
                </button>
                <button type="button" className="admin-secondary-btn flex-1 !px-3 !py-2" onClick={() => { setQueryDraft({ search: "", role: "", module: "", action: "", userName: "" }); setQuery({ search: "", role: "", module: "", action: "", userName: "" }); setPage(1); }}>
                  Reset
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Showing {totalFrom}-{totalTo} of {tablePagination.total}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600" htmlFor="activity-page-size">
                  Rows
                </label>
                <select id="activity-page-size" className="admin-input !mb-0 !w-auto" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>
                  {[25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tableError ? (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {tableError}
              </p>
            ) : null}

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="admin-table-head">
                  <tr>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Id
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Role
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      User
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Action
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Module
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Reference
                    </th>
                    <th className="border border-green-900 px-3 py-2 text-left">
                      Action Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td colSpan={7} className="border border-gray-300 px-3 py-4 text-slate-500">
                        Loading activity logs...
                      </td>
                    </tr>
                  ) : null}
                  {!tableLoading && tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-gray-300 px-3 py-4 text-slate-500">
                        No activity logs found for this filter.
                      </td>
                    </tr>
                  ) : null}
                  {!tableLoading
                    ? tableRows.map((row) => (
                        <tr key={row.Id} className="admin-table-row">
                          <td className="border border-gray-300 px-3 py-2 font-semibold text-slate-700">
                            {row.Id}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              {String(row.Role || "-").toLowerCase()}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {maskSensitiveIdentity(row.UserName || "-")}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              {row.Action || "-"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                              {row.Module || "-"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {row.ReferenceId ?? "-"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDateTime(row.ActionDate)}
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" className="admin-secondary-btn !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={tablePagination.page <= 1 || tableLoading} onClick={() => setPage(previous => Math.max(1, previous - 1))}>
                Previous
              </button>
              <p className="text-sm text-slate-600">
                Page {tablePagination.page} of {tablePagination.totalPages}
              </p>
              <button type="button" className="admin-secondary-btn !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={tablePagination.page>= tablePagination.totalPages || tableLoading} onClick={() => setPage(previous => Math.min(tablePagination.totalPages, previous + 1))}>
                Next
              </button>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
};

export default SuperAdminDashboard;

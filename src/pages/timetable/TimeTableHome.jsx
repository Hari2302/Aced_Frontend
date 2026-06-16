import { useEffect, useMemo, useState } from "react";
import { getClasses } from "../../services/classService";
import { getTeachers } from "../../services/teacherService";
import {
  createTimeTable,
  deleteTimeTable,
  getTimeTables,
  updateTimeTable,
} from "../../services/timetableService";

const parseEmails = (value) =>
  String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const createCumulativeRow = () => ({
  subject: "",
  portions: "",
  qns: "",
});

const createWeekendRow = () => ({
  date: "",
  day: "SATURDAY",
  subject: "",
  portions: "",
  qns: "",
  marks: "",
});

const DAY_OPTIONS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const deriveDayFromDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return DAY_OPTIONS[date.getDay() === 0 ? 6 : date.getDay() - 1];
};

const initialForm = {
  instituteName: "Kongu Neet Acadaemy",
  programLine: "",
  titleLine: "",
  classId: "",
  medium: "English Medium",

  cumulativeTestLabel: "Cumulative Test",
  cumulativeTiming: "",
  cumulativeDate: "",
  cumulativeDay: "MONDAY",
  cumulativeRows: [
    createCumulativeRow(),
    createCumulativeRow(),
    createCumulativeRow(),
    createCumulativeRow(),
  ],

  weekendTestLabel: "Weekend Test",
  weekendTiming: "",
  weekendRows: [
    createWeekendRow(),
    createWeekendRow(),
    createWeekendRow(),
    createWeekendRow(),
  ],

  sendToAdmin: true,
  sendToTeachers: true,
  adminEmails: "",
  additionalEmails: "",
  additionalMobileNumbers: "",
};

const toTemplateRows = (rows, rowFactory) => {
  if (!Array.isArray(rows) || rows.length === 0)
    return [rowFactory(), rowFactory(), rowFactory(), rowFactory()];
  return rows.map((row) => ({ ...rowFactory(), ...(row || {}) }));
};

const normalizeTemplatePayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  return {
    ...initialForm,
    ...payload,
    cumulativeRows: toTemplateRows(payload.cumulativeRows, createCumulativeRow),
    weekendRows: toTemplateRows(payload.weekendRows, createWeekendRow),
  };
};

const parseTemplatePayload = (value) => {
  if (!value) return null;
  if (typeof value === "object") return normalizeTemplatePayload(value);
  try {
    return normalizeTemplatePayload(JSON.parse(String(value)));
  } catch (_err) {
    return null;
  }
};

const normalizeTimeTable = (item) => ({
  id: item?.Id || item?.id || item?.TimeTableId || item?.timeTableId,
  subject: item?.Subject || item?.subject || "-",
  startDate:
    item?.StartDate ||
    item?.startDate ||
    item?.ScheduleDate ||
    item?.scheduleDate ||
    "-",
  endDate:
    item?.EndDate ||
    item?.endDate ||
    item?.ScheduleDate ||
    item?.scheduleDate ||
    "-",
  notes: item?.Notes || item?.notes || "",
  templatePayload: parseTemplatePayload(
    item?.TemplatePayload || item?.templatePayload,
  ),
  htmlBody:
    item?.EmailNotification?.HtmlBody ||
    item?.EmailNotification?.htmlBody ||
    item?.emailNotification?.HtmlBody ||
    item?.emailNotification?.htmlBody ||
    item?.HtmlBody ||
    item?.htmlBody ||
    "",
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDateOnly = (value) => {
  if (!value) return "-";
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return str;
  return date.toISOString().slice(0, 10);
};

const buildNotificationSummary = (response, actionLabel) => {
  const mailStatus = response?.mailStatus || {};
  const smsStatus = response?.smsStatus || {};
  const whatsAppStatus = response?.whatsAppStatus || {};

  const mailText = mailStatus.sent
    ? `Mail sent to ${mailStatus.recipientCount || 0}`
    : `Mail failed${mailStatus.reason ? `: ${mailStatus.reason}` : ""}`;

  let smsText = "SMS status unavailable";
  if (smsStatus.provider === "MOCK") {
    smsText = "SMS not sent. Backend is in MOCK mode";
  } else if (smsStatus.sent > 0 && Number(smsStatus.failed || 0) === 0) {
    smsText = `SMS sent to ${smsStatus.sent}`;
  } else if (smsStatus.sent > 0 && Number(smsStatus.failed || 0) > 0) {
    const firstError = smsStatus.failedDetails?.[0]?.error;
    smsText = `SMS sent ${smsStatus.sent}, failed ${smsStatus.failed}${firstError ? ` (${firstError})` : ""}`;
  } else if (smsStatus.reason) {
    smsText = `SMS failed: ${smsStatus.reason}`;
  } else if (Number(smsStatus.failed || 0) > 0) {
    const firstError = smsStatus.failedDetails?.[0]?.error;
    smsText = `SMS failed for ${smsStatus.failed}${firstError ? ` (${firstError})` : ""}`;
  }

  let whatsAppText = "WhatsApp not configured";
  if (whatsAppStatus.sent > 0 && Number(whatsAppStatus.failed || 0) === 0) {
    whatsAppText = `WhatsApp sent to ${whatsAppStatus.sent}`;
  } else if (
    whatsAppStatus.sent > 0 &&
    Number(whatsAppStatus.failed || 0) > 0
  ) {
    const firstError = whatsAppStatus.failedDetails?.[0]?.error;
    whatsAppText = `WhatsApp sent ${whatsAppStatus.sent}, failed ${whatsAppStatus.failed}${firstError ? ` (${firstError})` : ""}`;
  } else if (whatsAppStatus.reason) {
    whatsAppText = `WhatsApp failed: ${whatsAppStatus.reason}`;
  } else if (Number(whatsAppStatus.failed || 0) > 0) {
    const firstError = whatsAppStatus.failedDetails?.[0]?.error;
    whatsAppText = `WhatsApp failed for ${whatsAppStatus.failed}${firstError ? ` (${firstError})` : ""}`;
  }

  return `${actionLabel}. ${mailText}. ${smsText}. ${whatsAppText}.`;
};

const buildTemplateHtml = (form) => {
  const cumulativeRows = form.cumulativeRows.filter(
    (row) => row.subject || row.portions || row.qns,
  );
  const weekendRows = form.weekendRows.filter(
    (row) =>
      row.date ||
      row.day ||
      row.subject ||
      row.portions ||
      row.qns ||
      row.marks,
  );
  const cumulativeTotal = cumulativeRows.reduce(
    (sum, row) => sum + Number(row.qns || 0) * 4,
    0,
  );

  const cumulativeRowsHtml = cumulativeRows
    .map((row, index) => {
      const groupCells =
        index === 0
          ? `
            <td rowspan="${Math.max(cumulativeRows.length, 1)}" style="border:1px solid #b8c4cf;padding:10px 8px;background:#d8e2ec;text-align:center;font-size:13px;line-height:1.35;font-weight:700;color:#172a3a;">
              ${escapeHtml(form.cumulativeTestLabel || "-")}<br/>
              <span style="display:block;margin-top:4px;font-size:12px;font-weight:600;color:#2f4357;">${escapeHtml(form.cumulativeTiming || "-")}</span>
            </td>
            <td rowspan="${Math.max(cumulativeRows.length, 1)}" style="border:1px solid #b8c4cf;padding:10px 8px;background:#f1e4c4;text-align:center;font-size:13px;line-height:1.35;font-weight:700;color:#3a2a17;">
              ${escapeHtml(form.cumulativeDate || "-")}<br/>
              ${escapeHtml(form.cumulativeDay || "-")}
            </td>
          `
          : "";

      const marksCell =
        index === 0
          ? `<td rowspan="${Math.max(cumulativeRows.length, 1)}" style="border:1px solid #b8c4cf;padding:8px;background:#f6edd2;text-align:center;font-size:16px;font-weight:700;color:#1f3345;">${cumulativeTotal}</td>`
          : "";

      return `
        <tr>
          ${groupCells}
          <td style="border:1px solid #b8c4cf;padding:9px 8px;background:#f6edd2;text-align:center;font-size:13px;font-weight:700;color:#1f3345;">${escapeHtml(row.subject || "-")}</td>
          <td style="border:1px solid #b8c4cf;padding:9px 10px;background:#f1e4c4;font-size:13px;line-height:1.4;font-weight:600;color:#3b2d1d;">• ${escapeHtml(row.portions || "-")}</td>
          <td style="border:1px solid #b8c4cf;padding:8px;background:#f6edd2;text-align:center;font-size:16px;font-weight:700;color:#1f3345;">${escapeHtml(row.qns || "0")}</td>
          ${marksCell}
        </tr>
      `;
    })
    .join("");

  const weekendRowsHtml = weekendRows
    .map(
      (row, index) => `
        <tr>
          ${
            index === 0
              ? `
              <td rowspan="${Math.max(weekendRows.length, 1)}" style="border:1px solid #b8c4cf;padding:10px 8px;background:#d8e2ec;text-align:center;font-size:13px;line-height:1.35;font-weight:700;color:#172a3a;">
                ${escapeHtml(form.weekendTestLabel || "-")}<br/>
                <span style="display:block;margin-top:4px;font-size:12px;font-weight:600;color:#2f4357;">${escapeHtml(form.weekendTiming || "-")}</span>
              </td>
            `
              : ""
          }
          <td style="border:1px solid #b8c4cf;padding:9px 8px;background:${index % 2 === 0 ? "#e8eff6" : "#f3e9dc"};text-align:center;font-size:13px;line-height:1.35;font-weight:700;color:#2a1f17;">
            ${escapeHtml(row.date || "-")}<br/>
            ${escapeHtml(row.day || "-")}
          </td>
          <td style="border:1px solid #b8c4cf;padding:9px 8px;background:${index % 2 === 0 ? "#e8eff6" : "#f3e9dc"};text-align:center;font-size:13px;font-weight:700;color:#1f3345;">${escapeHtml(row.subject || "-")}</td>
          <td style="border:1px solid #b8c4cf;padding:9px 10px;background:${index % 2 === 0 ? "#e8eff6" : "#f3e9dc"};font-size:13px;line-height:1.4;font-weight:600;color:#2f241c;">• ${escapeHtml(row.portions || "-")}</td>
          <td style="border:1px solid #b8c4cf;padding:8px;background:${index % 2 === 0 ? "#e8eff6" : "#f3e9dc"};text-align:center;font-size:14px;font-weight:700;color:#1f3345;">${escapeHtml(row.qns || "0")}</td>
          <td style="border:1px solid #b8c4cf;padding:8px;background:${index % 2 === 0 ? "#e8eff6" : "#f3e9dc"};text-align:center;font-size:14px;font-weight:700;color:#1f3345;">${escapeHtml(row.marks || "0")}</td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#edf3f8;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1f2f3f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:18px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="920" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #c7d1db;border-radius:12px;overflow:hidden;box-shadow:0 10px 24px rgba(22,40,58,0.14);">
            <tr>
              <td style="padding:18px 18px 8px 18px;font-size:15px;line-height:1.8;color:#1f2f3f;">
                Dear Team,
                <br/><br/>
                A timetable has been submitted. Please find the details below.
              </td>
            </tr>
            <tr>
              <td style="background:linear-gradient(135deg,#0b3f76,#195a98);color:#f8fbff;text-align:center;padding:16px 14px;border-bottom:3px solid #d9e4ee;">
                <div style="font-size:32px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;font-weight:700;line-height:1.16;letter-spacing:0.2px;">${escapeHtml(form.instituteName || "-")}</div>
                <div style="margin-top:5px;font-size:24px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;font-weight:600;color:#dceeff;line-height:1.22;">${escapeHtml(form.programLine || "-")}</div>
                <div style="margin-top:6px;font-size:30px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;font-weight:700;line-height:1.16;letter-spacing:0.2px;">${escapeHtml(form.titleLine || "-")}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
                  <thead>
                    <tr>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">TEST & TIMING</th>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">DATE & DAY</th>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">SUBJECT</th>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">PORTIONS</th>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">NO. OF QNS.</th>
                      <th style="border:1px solid #b8c4cf;padding:10px 8px;background:#cfdae6;color:#102437;font-size:13px;font-weight:800;letter-spacing:0.3px;">MARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cumulativeRowsHtml}
                    ${weekendRowsHtml}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 14px 16px 14px;font-size:15px;line-height:1.8;color:#1f2f3f;">
                Regards,
                <br/>
                Kongu Neet Acedamy
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};

const TimeTableHome = () => {
  const [timeTables, setTimeTables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [savedPreviewHtml, setSavedPreviewHtml] = useState("");
  const [confirmDeleteRow, setConfirmDeleteRow] = useState(null);
  const [editingTimeTableId, setEditingTimeTableId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [ttData, classData, teacherData] = await Promise.all([
          getTimeTables(),
          getClasses(),
          getTeachers(),
        ]);
        setTimeTables(Array.isArray(ttData) ? ttData : []);
        setClasses(Array.isArray(classData) ? classData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } catch (err) {
        setError(err.message || "Failed to load time table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const classNameById = useMemo(() => {
    return classes.reduce((acc, item) => {
      const id = item?.Id ?? item?.id;
      const name = item?.ClassName ?? item?.className;
      if (id !== undefined && name) acc[String(id)] = name;
      return acc;
    }, {});
  }, [classes]);

  const teacherEmails = useMemo(() => {
    return teachers
      .map((teacher) => teacher?.Email || teacher?.email)
      .filter((email) => typeof email === "string" && email.trim().length > 0);
  }, [teachers]);

  const previewHtml = useMemo(() => buildTemplateHtml(form), [form]);

  const cumulativeTotalMarks = useMemo(() => {
    return form.cumulativeRows.reduce(
      (sum, row) => sum + Number(row.qns || 0) * 4,
      0,
    );
  }, [form.cumulativeRows]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCumulativeRow = (index, key, value) => {
    setForm((prev) => {
      const rows = [...prev.cumulativeRows];
      rows[index] = { ...rows[index], [key]: value };
      return { ...prev, cumulativeRows: rows };
    });
  };

  const updateWeekendRow = (index, key, value) => {
    setForm((prev) => {
      const rows = [...prev.weekendRows];
      rows[index] = { ...rows[index], [key]: value };
      return { ...prev, weekendRows: rows };
    });
  };

  const addCumulativeRow = () => {
    setForm((prev) => ({
      ...prev,
      cumulativeRows: [...prev.cumulativeRows, createCumulativeRow()],
    }));
  };

  const addWeekendRow = () => {
    setForm((prev) => ({
      ...prev,
      weekendRows: [...prev.weekendRows, createWeekendRow()],
    }));
  };

  const handleCumulativeDateChange = (value) => {
    setForm((prev) => ({
      ...prev,
      cumulativeDate: value,
      cumulativeDay: deriveDayFromDate(value) || prev.cumulativeDay,
    }));
  };

  const handleWeekendDateChange = (index, value) => {
    setForm((prev) => {
      const rows = [...prev.weekendRows];
      rows[index] = {
        ...rows[index],
        date: value,
        day: deriveDayFromDate(value) || rows[index].day,
      };
      return { ...prev, weekendRows: rows };
    });
  };

  const removeCumulativeRow = (index) => {
    setForm((prev) => {
      if (prev.cumulativeRows.length <= 1) return prev;
      return {
        ...prev,
        cumulativeRows: prev.cumulativeRows.filter((_, i) => i !== index),
      };
    });
  };

  const removeWeekendRow = (index) => {
    setForm((prev) => {
      if (prev.weekendRows.length <= 1) return prev;
      return {
        ...prev,
        weekendRows: prev.weekendRows.filter((_, i) => i !== index),
      };
    });
  };

  const openCreate = () => {
    setError("");
    setOkMessage("");
    setForm(initialForm);
    setEditingTimeTableId(null);
    setShowTemplatePreview(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowTemplatePreview(false);
    setEditingTimeTableId(null);
    setIsModalOpen(false);
  };

  const openSavedPreview = (row) => {
    const html = row?.htmlBody;
    if (!html || !String(html).trim()) {
      setError("No saved email template found for this record.");
      return;
    }
    setError("");
    setSavedPreviewHtml(String(html));
  };

  const handleDeleteSaved = async (row) => {
    if (!row?.id) {
      setError("Unable to delete this record: missing id.");
      return;
    }

    try {
      setError("");
      setDeletingId(row.id);
      await deleteTimeTable(row.id);
      const refreshed = await getTimeTables();
      setTimeTables(Array.isArray(refreshed) ? refreshed : []);
      setConfirmDeleteRow(null);
    } catch (err) {
      setError(err.message || "Failed to delete saved timetable.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditSaved = (row) => {
    if (!row?.id) {
      setError("Unable to edit this record: missing id.");
      return;
    }
    const payload = normalizeTemplatePayload(row.templatePayload);
    if (!payload) {
      setError(
        "No editable template payload found for this record. Create a new template once, then edit.",
      );
      return;
    }
    setError("");
    setOkMessage("");
    setForm(payload);
    setEditingTimeTableId(row.id);
    setShowTemplatePreview(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setOkMessage("");

    const adminEmails = parseEmails(form.adminEmails);
    const additionalEmails = parseEmails(form.additionalEmails);
    const teacherRecipientEmails = form.sendToTeachers ? teacherEmails : [];
    const toEmails = Array.from(
      new Set([
        ...(form.sendToAdmin ? adminEmails : []),
        ...teacherRecipientEmails,
        ...additionalEmails,
      ]),
    );

    if (toEmails.length === 0) {
      setError(
        "No recipients found. Add admin/additional emails or keep 'Send to All Teachers' enabled.",
      );
      return;
    }

    const className = classNameById[String(form.classId)] || "General";
    const htmlBody = buildTemplateHtml(form);
    const filledWeekendRows = form.weekendRows.filter(
      (row) =>
        row.date ||
        row.day ||
        row.subject ||
        row.portions ||
        row.qns ||
        row.marks,
    );
    const weekendDates = filledWeekendRows
      .map((row) => String(row.date || "").trim())
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
    const computedEndDate =
      weekendDates.length > 0
        ? [...weekendDates].sort((a, b) => a.localeCompare(b))[
            weekendDates.length - 1
          ]
        : form.cumulativeDate || null;

    const payload = {
      ClassId: Number(form.classId || 0),
      AssignedTeacherId: 0,
      Subject: "Cumulative & Weekend Test Portions",
      DayOfWeek: form.cumulativeDay || "-",
      StartDate: form.cumulativeDate || null,
      EndDate: computedEndDate,
      ScheduleDate: form.cumulativeDate || null,
      StartTime: form.cumulativeTiming || "-",
      EndTime: form.weekendTiming || "-",
      RoomNumber: "-",
      LearningMode: "Offline",
      Medium: form.medium,
      Notes: "Template-based timetable sent to teachers.",
      TemplatePayload: JSON.stringify(form),
      IsActive: 1,
      EmailNotification: {
        SendToAdmin: form.sendToAdmin ? 1 : 0,
        SendToTeachers: form.sendToTeachers ? 1 : 0,
        TeacherRecipientMode: "all",
        AdminEmail: adminEmails[0] || "",
        AdminEmails: adminEmails,
        TeacherEmails: teacherRecipientEmails,
        AdditionalEmails: additionalEmails,
        AdditionalMobileNumbers: form.additionalMobileNumbers,
        ToEmails: toEmails,
        Subject: `${form.titleLine || "Time Table"} - ${className}`,
        HtmlBody: htmlBody,
      },
    };

    try {
      setSaving(true);
      let response;
      if (editingTimeTableId) {
        response = await updateTimeTable(editingTimeTableId, payload);
        setOkMessage(buildNotificationSummary(response, "Template updated"));
      } else {
        response = await createTimeTable(payload);
        setOkMessage(buildNotificationSummary(response, "Template created"));
      }
      setEditingTimeTableId(null);
      setIsModalOpen(false);

      const refreshed = await getTimeTables();
      setTimeTables(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      setError(err.message || "Failed to save and send timetable.");
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => timeTables.map(normalizeTimeTable), [timeTables]);

  return (
    <div className="p-3 sm:p-4 md:p-6 admin-page-enter">
      <div className="admin-card admin-card-animate p-5 md:p-6 mb-6 bg-gradient-to-r from-[#0b5d42] via-[#0f8f5c] to-[#17a86f] text-white border-none shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-emerald-600 text-xs sm:text-sm tracking-wide uppercase">
              Communication + Scheduling
            </p>
            <h1 className="text-emerald-900  admin-title text-2xl md:text-3xl font-bold mt-1">
              Template Time Table
            </h1>
            <p className="text-emerald-900  text-sm mt-2">
              Fill the template form and send directly to all teachers by email.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="site-btn-primary w-fit">
            Create Time Table
          </button>
        </div>
      </div>

      {okMessage ? (
        <p className="text-sm text-emerald-700 mb-4">{okMessage}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-card admin-card-animate p-4 sm:p-5" style={{ animationDelay: "120ms" }}>
        <h3 className="admin-title font-semibold text-lg text-gray-800 mb-3">
          Saved Time Tables
        </h3>
        {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
        {!loading ? (
          <div className="overflow-x-auto rounded-xl border border-emerald-100 shadow-inner">
            <table className="w-full text-sm border-collapse">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    Subject
                  </th>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    End Date
                  </th>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    Edit
                  </th>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    Preview
                  </th>
                  <th className="text-left py-3 px-3 font-bold border border-green-900">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 px-3 border border-gray-300 text-slate-500">
                      No records yet.
                    </td>
                  </tr>
                ) : null}
                {rows.map((row) => (
                  <tr key={row.id || `${row.subject}-${row.startDate}-${row.endDate}`} className="admin-table-row">
                    <td className="py-3 px-3 border border-gray-300">
                      {row.subject}
                    </td>
                    <td className="py-3 px-3 border border-gray-300">
                      {formatDateOnly(row.startDate)}
                    </td>
                    <td className="py-3 px-3 border border-gray-300">
                      {formatDateOnly(row.endDate)}
                    </td>
                    <td className="py-3 px-3 border border-gray-300">
                      <button type="button" className="admin-action-icon-btn is-edit" onClick={() => openEditSaved(row)} aria-label="Edit saved timetable" title="Edit">
                        <img src="/edit.svg" alt="" className="admin-action-icon" />
                      </button>
                    </td>
                    <td className="py-3 px-3 border border-gray-300">
                      <button type="button" className="admin-action-icon-btn is-preview" onClick={() => openSavedPreview(row)} aria-label="Preview saved timetable" title="Preview">
                        <img src="/preview.svg" alt="" className="admin-action-icon" />
                      </button>
                    </td>
                    <td className="py-3 px-3 border border-gray-300">
                      <button type="button" className="admin-action-icon-btn is-delete" onClick={() => setConfirmDeleteRow(row)} disabled={deletingId === row.id} aria-label="Delete saved timetable" title={deletingId === row.id ? "Deleting" : "Delete"}>
                        <img src="/delete.svg" alt="" className="admin-action-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="admin-card admin-card-animate w-full rounded-2xl p-3 sm:p-4 md:p-5 border border-emerald-100/80">
            <div className="mb-4 flex items-center justify-between rounded-xl px-2 py-2 border border-emerald-100 bg-white">
              <h2 className="admin-title text-base sm:text-lg font-semibold text-gray-800">
                {editingTimeTableId
                  ? "Edit Template Time Table"
                  : "Create Template Time Table"}
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowTemplatePreview(true)} className="admin-action-icon-btn is-preview" aria-label="Template preview" title="Template preview">
                  <img src="/preview.svg" alt="" className="admin-action-icon" />
                </button>
                <button type="button" onClick={closeModal} className="admin-action-icon-btn is-close" aria-label="Close" title="Close">
                  <img src="/close.svg" alt="" className="admin-action-icon" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-5">
              <div className="space-y-4">
                <div className="site-card p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Template Header
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="text" className="admin-input md:col-span-2" placeholder="Institute Name" value={form.instituteName} onChange={e => setField("instituteName", e.target.value)} required />
                    <input type="text" className="admin-input md:col-span-2" placeholder="Program Line" value={form.programLine} onChange={e => setField("programLine", e.target.value)} required />
                    <input type="text" className="admin-input md:col-span-2" placeholder="Title Line" value={form.titleLine} onChange={e => setField("titleLine", e.target.value)} required />
                    <select value={form.classId} onChange={e => setField("classId", e.target.value)} className="admin-input" required>
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
                    <select value={form.medium} onChange={e => setField("medium", e.target.value)} className="admin-input">
                      <option value="English Medium">English Medium</option>
                      <option value="Tamil Medium">Tamil Medium</option>
                    </select>
                  </div>
                </div>

                <div className="site-card p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Cumulative Test Block
                    </p>
                    <button type="button" className="admin-secondary-btn" onClick={addCumulativeRow}>
                      Add Row
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <input type="text" className="admin-input" placeholder="Test Name (e.g. CUMULATIVE TEST)" value={form.cumulativeTestLabel} onChange={e => setField("cumulativeTestLabel", e.target.value)} required />
                    <input type="text" className="admin-input" placeholder="Timing (e.g. [4.00 - 6.00 PM])" value={form.cumulativeTiming} onChange={e => setField("cumulativeTiming", e.target.value)} required />
                    <input type="date" className="admin-input" value={form.cumulativeDate} onChange={e => handleCumulativeDateChange(e.target.value)} required />
                    <select className="admin-input" value={form.cumulativeDay} onChange={e => setField("cumulativeDay", e.target.value)} required>
                      {DAY_OPTIONS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {form.cumulativeRows.map((row, index) => (
                      <div key={`cum-${index}`} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg border border-emerald-100 bg-emerald-50/30 p-2">
                        <input className="admin-input sm:col-span-3" placeholder="Subject" value={row.subject} onChange={e => updateCumulativeRow(index, "subject", e.target.value)} required />
                        <input className="admin-input sm:col-span-6" placeholder="Portions" value={row.portions} onChange={e => updateCumulativeRow(index, "portions", e.target.value)} required />
                        <input className="admin-input sm:col-span-2" type="number" min="0" placeholder="Qns" value={row.qns} onChange={e => updateCumulativeRow(index, "qns", e.target.value)} required />
                        <button type="button" className="admin-secondary-btn sm:col-span-1 px-0 min-h-10" onClick={() => removeCumulativeRow(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Cumulative Marks (auto = sum of qns x 4):{" "}
                    {cumulativeTotalMarks}
                  </p>
                </div>

                <div className="site-card p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Weekend Test Block
                    </p>
                    <button type="button" className="admin-secondary-btn" onClick={addWeekendRow}>
                      Add Row
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <input type="text" className="admin-input" placeholder="Test Name (e.g. WEEKEND TEST)" value={form.weekendTestLabel} onChange={e => setField("weekendTestLabel", e.target.value)} required />
                    <input type="text" className="admin-input" placeholder="Timing (e.g. [5.00 - 6.00 PM])" value={form.weekendTiming} onChange={e => setField("weekendTiming", e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    {form.weekendRows.map((row, index) => (
                      <div key={`week-${index}`} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg border border-emerald-100 bg-emerald-50/30 p-2">
                        <input className="admin-input sm:col-span-2" type="date" value={row.date} onChange={e => handleWeekendDateChange(index, e.target.value)} required />
                        <select className="admin-input sm:col-span-1" value={row.day} onChange={e => updateWeekendRow(index, "day", e.target.value)} required>
                          {DAY_OPTIONS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <input className="admin-input sm:col-span-2" placeholder="Subject" value={row.subject} onChange={e => updateWeekendRow(index, "subject", e.target.value)} required />
                        <input className="admin-input sm:col-span-3" placeholder="Portions" value={row.portions} onChange={e => updateWeekendRow(index, "portions", e.target.value)} required />
                        <input className="admin-input sm:col-span-1" type="number" min="0" placeholder="Qns" value={row.qns} onChange={e => updateWeekendRow(index, "qns", e.target.value)} required />
                        <input className="admin-input sm:col-span-2" type="number" min="0" placeholder="Marks" value={row.marks} onChange={e => updateWeekendRow(index, "marks", e.target.value)} required />
                        <button type="button" className="admin-secondary-btn sm:col-span-1 px-0 min-h-10" onClick={() => removeWeekendRow(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="site-card p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Email Delivery
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form.sendToAdmin} onChange={e => setField("sendToAdmin", e.target.checked)} />
                      Send to Admin
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form.sendToTeachers} onChange={e => setField("sendToTeachers", e.target.checked)} />
                      Send to All Teachers
                    </label>
                  </div>
                  <textarea className="admin-input mb-3" rows={2} placeholder="Admin Emails (comma/new line)" value={form.adminEmails} onChange={e => setField("adminEmails", e.target.value)} />
                  <textarea className="admin-input" rows={2} placeholder="Additional Emails (optional)" value={form.additionalEmails} onChange={e => setField("additionalEmails", e.target.value)} />
                  <textarea className="admin-input mt-3" rows={2} placeholder="Mobile Numbers for SMS (comma/new line)" value={form.additionalMobileNumbers} onChange={e => setField("additionalMobileNumbers", e.target.value)} />
                  <p className="text-xs text-slate-500 mt-2">
                    Teachers with valid email found: {teacherEmails.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-emerald-100 flex flex-wrap items-center gap-2 rounded-lg px-2 pb-1">
              <button type="submit" disabled={saving} className="admin-primary-btn disabled:opacity-70">
                {saving
                  ? "Saving & Sending..."
                  : editingTimeTableId
                    ? "Update & Send to All Teachers"
                    : "Save & Send to All Teachers"}
              </button>
              <button type="button" onClick={closeModal} disabled={saving} className="admin-secondary-btn disabled:opacity-70">
                Cancel
              </button>
            </div>
          </form>

          {showTemplatePreview ? (
            <div className="fixed inset-0 z-[90]  bg-black/60 p-3">
              <div className="admin-card w-full max-w-6xl rounded-2xl p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="admin-title text-base sm:text-lg font-semibold text-gray-800">
                    Template Preview
                  </h3>
                  <button type="button" onClick={() => setShowTemplatePreview(false)} className="admin-action-icon-btn is-close" aria-label="Close preview" title="Close preview">
                    <img src="/close.svg" alt="" className="admin-action-icon" />
                  </button>
                </div>
                <div className="border border-emerald-100 rounded-lg bg-white h-[80vh] overflow-auto">
                  <iframe title="Template Preview" srcDoc={previewHtml} className="w-full h-full border-0" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {savedPreviewHtml ? (
        <div className="fixed inset-0 z-[95]  bg-black/60 p-3">
          <div className="admin-card w-full max-w-6xl rounded-2xl p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="admin-title text-base sm:text-lg font-semibold text-gray-800">
                Saved Email Template Preview
              </h3>
              <button type="button" onClick={() => setSavedPreviewHtml("")} className="admin-action-icon-btn is-close" aria-label="Close preview" title="Close preview">
                <img src="/close.svg" alt="" className="admin-action-icon" />
              </button>
            </div>
            <div className="border border-emerald-100 rounded-lg bg-white h-[80vh] overflow-auto">
              <iframe title="Saved Email Template Preview" srcDoc={savedPreviewHtml} className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      ) : null}

      {confirmDeleteRow ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3">
          <div className="admin-card w-full max-w-md rounded-2xl p-4">
            <h3 className="admin-title text-lg font-semibold text-gray-800">
              Delete Saved Record
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete this saved time table record?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="admin-secondary-btn" onClick={() => setConfirmDeleteRow(null)}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn disabled:opacity-70" onClick={() => handleDeleteSaved(confirmDeleteRow)} disabled={deletingId === confirmDeleteRow.id}>
                {deletingId === confirmDeleteRow.id
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

export default TimeTableHome;

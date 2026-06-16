import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  getAdminSettings,
  resetAdminSettings,
  saveAdminSettings,
} from "../../services/adminSettingsService";

const landingOptions = [
  { value: "/admin/dashboard", label: "Dashboard" },
  { value: "/admin/students", label: "Students" },
  { value: "/admin/teachers", label: "Teachers" },
  { value: "/admin/classes", label: "Classes" },
  { value: "/admin/timetable", label: "Time Table" },
  { value: "/admin/exams", label: "Exams" },
  { value: "/admin/settings", label: "Settings" },
];

const settingsGroups = [
  {
    title: "Workspace",
    items: [
      {
        key: "compactSidebar",
        label: "Compact sidebar",
      },
      {
        key: "reducedMotion",
        label: "Reduced motion",
      },
    ],
  },
  {
    title: "Dashboard",
    items: [
      {
        key: "showWelcomeBanner",
        label: "Welcome banner",
      },
      {
        key: "showActiveStats",
        label: "Active stats row",
      },
      {
        key: "showRevenueCard",
        label: "Revenue card",
      },
      {
        key: "showCalendarWidget",
        label: "Calendar widget",
      },
      {
        key: "showAwardsWidget",
        label: "Awards widget",
      },
      {
        key: "showSystemActivity",
        label: "System activity logs",
      },
    ],
  },
];

const SettingToggle = ({ checked, label, onToggle }) => (
  <div className="admin-setting-row">
    <div className="min-w-0">
      <p className="admin-setting-row-title">{label}</p>
    </div>
    <button type="button" onClick={onToggle} className={`admin-setting-switch ${checked ? "is-on" : ""}`} aria-pressed={checked}>
      <span className="admin-setting-switch-thumb" />
    </button>
  </div>
);

const SummaryCard = ({ label, value }) => (
  <div className="admin-setting-summary-card">
    <p className="admin-setting-summary-label">{label}</p>
    <p className="admin-setting-summary-value">{value}</p>
  </div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => getAdminSettings());
  const [savedMessage, setSavedMessage] = useState("");

  const currentLandingLabel = useMemo(
    () =>
      landingOptions.find(
        (option) => option.value === settings.defaultLandingPage,
      )?.label || "Dashboard",
    [settings.defaultLandingPage],
  );

  const enabledBlocks = [
    settings.showWelcomeBanner,
    settings.showActiveStats,
    settings.showRevenueCard,
    settings.showCalendarWidget,
    settings.showAwardsWidget,
    settings.showSystemActivity,
  ].filter(Boolean).length;

  const updateSetting = (key, value) => {
    setSavedMessage("");
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const handleSave = () => {
    const next = saveAdminSettings(settings);
    setSettings(next);
    setSavedMessage("Settings saved successfully.");
  };

  const handleReset = () => {
    const next = resetAdminSettings();
    setSettings(next);
    setSavedMessage("Settings reset to default values.");
  };

  return (
    <main className="relative">
      <section className="admin-settings-hero">
        <div>
          <h1 className="admin-title admin-settings-title">Settings</h1>
        </div>

        <div className="admin-settings-hero-box">
          <p className="admin-settings-hero-name">
            {user?.displayName || user?.userName || "Administrator"}
          </p>
          <p className="admin-settings-hero-role">{user?.role || "admin"}</p>
        </div>
      </section>

      {savedMessage ? (
        <div className="admin-settings-alert">{savedMessage}</div>
      ) : null}

      <section className="admin-settings-panel">
        <div className="admin-settings-panel-head">
          <div>
            <h2 className="admin-title admin-settings-section-title">
              Start Page
            </h2>
          </div>
        </div>

        <div className="admin-settings-chip-grid">
          {landingOptions.map((option) => (
            <button key={option.value} type="button" onClick={() => updateSetting("defaultLandingPage", option.value)} className={`admin-settings-chip ${settings.defaultLandingPage === option.value ? "is-active" : ""}`}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="admin-settings-grid">
        {settingsGroups.map((group) => (
          <section key={group.title} className="admin-settings-panel">
            <div className="admin-settings-panel-head">
              <div>
                <h2 className="admin-title admin-settings-section-title">
                  {group.title}
                </h2>
              </div>
            </div>

            <div className="admin-settings-list">
              {group.items.map((item) => (
                <SettingToggle key={item.key} checked={Boolean(settings[item.key])} label={item.label} onToggle={() => updateSetting(item.key, !settings[item.key])} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="admin-settings-panel">
        <div className="admin-settings-panel-head">
          <div>
            <h2 className="admin-title admin-settings-section-title">
              Summary
            </h2>
          </div>

          <div className="admin-settings-actions">
            <button type="button" className="admin-settings-btn admin-settings-btn-secondary" onClick={handleReset}>
              Reset Default
            </button>
            <button type="button" className="admin-settings-btn admin-settings-btn-primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>

        <div className="admin-settings-summary-grid">
          <SummaryCard label="Landing Page" value={currentLandingLabel} />
          <SummaryCard label="Sidebar" value={settings.compactSidebar ? "Compact" : "Expanded"} />
          <SummaryCard label="Motion" value={settings.reducedMotion ? "Reduced" : "Standard"} />
          <SummaryCard label="Visible Blocks" value={`${enabledBlocks}/6`} />
        </div>

        <div className="admin-settings-note">
          Default: Dashboard, Expanded, Standard
        </div>
      </section>
    </main>
  );
};

export default AdminSettings;

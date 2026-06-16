const STORAGE_KEY = "admin_settings";
const SETTINGS_EVENT = "admin-settings-updated";

export const defaultAdminSettings = {
  defaultLandingPage: "/admin/dashboard",
  compactSidebar: false,
  reducedMotion: false,
  showWelcomeBanner: true,
  showActiveStats: true,
  showRevenueCard: true,
  showCalendarWidget: true,
  showAwardsWidget: true,
  showSystemActivity: true,
};

export const getAdminSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultAdminSettings };
    const parsed = JSON.parse(raw);
    return {
      ...defaultAdminSettings,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
  } catch (_err) {
    return { ...defaultAdminSettings };
  }
};

export const saveAdminSettings = (nextSettings) => {
  const merged = {
    ...defaultAdminSettings,
    ...(nextSettings && typeof nextSettings === "object" ? nextSettings : {}),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: merged }));
  }

  return merged;
};

export const resetAdminSettings = () => {
  localStorage.removeItem(STORAGE_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SETTINGS_EVENT, { detail: { ...defaultAdminSettings } }),
    );
  }

  return { ...defaultAdminSettings };
};

export const subscribeAdminSettings = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (event) =>
    callback(event.detail || getAdminSettings());
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getAdminSettings());
    }
  };

  window.addEventListener(SETTINGS_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SETTINGS_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
};

import { apiRequest } from "./api";

export const getRecentActivityLogs = async (
  limit = 200,
  { excludeSuperadmin = false } = {},
) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (excludeSuperadmin) params.set("excludeSuperadmin", "1");
  const data = await apiRequest(`/api/activity-logs?${params.toString()}`);
  return Array.isArray(data) ? data : [];
};

export const getActivityLogsPage = async ({
  page = 1,
  pageSize = 25,
  search = "",
  module = "",
  action = "",
  userName = "",
  role = "",
  excludeSuperadmin = false,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (search.trim()) params.set("search", search.trim());
  if (module.trim()) params.set("module", module.trim());
  if (action.trim()) params.set("action", action.trim());
  if (userName.trim()) params.set("userName", userName.trim());
  if (role.trim()) params.set("role", role.trim());
  if (excludeSuperadmin) params.set("excludeSuperadmin", "1");

  const data = await apiRequest(`/api/activity-logs?${params.toString()}`);

  return {
    rows: Array.isArray(data?.rows) ? data.rows : [],
    pagination: {
      page: Number(data?.pagination?.page || page),
      pageSize: Number(data?.pagination?.pageSize || pageSize),
      total: Number(data?.pagination?.total || 0),
      totalPages: Number(data?.pagination?.totalPages || 1),
    },
  };
};

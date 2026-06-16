import { apiRequest } from "./api";

export const getAdminUsers = async () => {
  const data = await apiRequest("/api/admin-users");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

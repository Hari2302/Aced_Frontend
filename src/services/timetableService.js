import { apiRequest } from "./api";

export const getTimeTables = async () => {
  const data = await apiRequest("/api/timetables");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createTimeTable = async (payload) => {
  return apiRequest("/api/timetables", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateTimeTable = async (id, payload) => {
  return apiRequest(`/api/timetables/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteTimeTable = async (id) => {
  return apiRequest(`/api/timetables/${id}`, {
    method: "DELETE",
  });
};

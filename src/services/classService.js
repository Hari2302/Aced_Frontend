import { apiRequest } from "./api";

export const getClasses = async () => {
  const data = await apiRequest("/api/classes");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createClass = async (payload) => {
  return apiRequest("/api/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateClass = async (id, payload) => {
  return apiRequest(`/api/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteClass = async (id) => {
  return apiRequest(`/api/classes/${id}`, {
    method: "DELETE",
  });
};

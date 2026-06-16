import { apiRequest } from "./api";

export const getAssignments = async () => {
  const data = await apiRequest("/api/assignments");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createAssignment = async (payload) => {
  return apiRequest("/api/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateAssignment = async (id, payload) => {
  return apiRequest(`/api/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteAssignment = async (id) => {
  return apiRequest(`/api/assignments/${id}`, {
    method: "DELETE",
  });
};

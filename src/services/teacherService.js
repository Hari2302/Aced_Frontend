import { apiRequest } from "./api";

export const getTeachers = async () => {
  const data = await apiRequest("/api/teachers");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createTeacher = async (payload) => {
  return apiRequest("/api/teachers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateTeacher = async (id, payload) => {
  return apiRequest(`/api/teachers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteTeacher = async (id) => {
  return apiRequest(`/api/teachers/${id}`, {
    method: "DELETE",
  });
};

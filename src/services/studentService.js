import { apiRequest } from "./api";

export const getStudents = async () => {
  const data = await apiRequest("/api/students");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createStudent = async (payload) => {
  return apiRequest("/api/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateStudent = async (id, payload) => {
  return apiRequest(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteStudent = async (id) => {
  return apiRequest(`/api/students/${id}`, {
    method: "DELETE",
  });
};

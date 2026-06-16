import { apiRequest } from "./api";

export const getExams = async () => {
  const data = await apiRequest("/api/exams");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const createExam = async (payload) => {
  return apiRequest("/api/exams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateExam = async (id, payload) => {
  return apiRequest(`/api/exams/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteExam = async (id) => {
  return apiRequest(`/api/exams/${id}`, {
    method: "DELETE",
  });
};

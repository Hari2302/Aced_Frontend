import { apiRequest } from "./api";

export const teacherLogin = async ({ email, phoneNumber }) =>
  apiRequest("/api/teacher-portal/login", {
    method: "POST",
    body: JSON.stringify({ email, phoneNumber }),
  });

export const getTeacherDashboard = async () =>
  apiRequest("/api/teacher-portal/dashboard");

export const createTeacherAssignment = async (payload) =>
  apiRequest("/api/teacher-portal/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTeacherAssignment = async (id, payload) =>
  apiRequest(`/api/teacher-portal/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteTeacherAssignment = async (id) =>
  apiRequest(`/api/teacher-portal/assignments/${id}`, {
    method: "DELETE",
  });

export const createTeacherTest = async (payload) =>
  apiRequest("/api/teacher-portal/tests", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTeacherTest = async (id, payload) =>
  apiRequest(`/api/teacher-portal/tests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteTeacherTest = async (id) =>
  apiRequest(`/api/teacher-portal/tests/${id}`, {
    method: "DELETE",
  });

export const getTeacherTestAttempts = async (id) =>
  apiRequest(`/api/teacher-portal/tests/${id}/attempts`);

export const gradeTeacherTestAttempt = async ({ examId, attemptId, payload }) =>
  apiRequest(
    `/api/teacher-portal/tests/${examId}/attempts/${attemptId}/grade`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

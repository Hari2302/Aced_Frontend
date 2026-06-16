// src/services/authService.js

import { apiRequest } from "./api";

export const login = async (userName, password) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      userName,
      password,
    }),
  });
};

export const forgotPassword = async (email) => {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async ({
  email,
  otp,
  newPassword,
  confirmPassword,
}) => {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      newPassword,
      confirmPassword,
    }),
  });
};

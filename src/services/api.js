// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === "object" && data?.message) ||
      (typeof data === "string" && data) ||
      "Something went wrong";

    throw new Error(message);
  }

  return data;
};

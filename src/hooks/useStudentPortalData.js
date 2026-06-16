import { useCallback, useEffect, useState } from "react";
import { getStudentToken } from "../services/studentPortalAuth";
import { getStudentDashboard } from "../services/studentPortalService";

export const useStudentPortalData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const token = getStudentToken();
    if (!token) {
      setError("Student session not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const dashboard = await getStudentDashboard(token);
      setData(dashboard);
    } catch (err) {
      setError(err.message || "Failed to load student dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    const handleWindowFocus = () => {
      fetchData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refresh: fetchData,
  };
};

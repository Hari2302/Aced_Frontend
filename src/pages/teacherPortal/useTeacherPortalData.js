import { useCallback, useEffect, useState } from "react";
import { getTeacherDashboard } from "../../services/teacherPortalService";

export const useTeacherPortalData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getTeacherDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load teacher dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
    setError,
  };
};

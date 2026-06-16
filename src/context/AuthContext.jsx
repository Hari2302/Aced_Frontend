import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextObject";

const TOKEN_KEY = "token";
const encodeBase64Url = (value) =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const createDevAuthToken = (payload) => {
  const header = encodeBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.dev`;
};

const getInitialToken = () => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (storedToken) return storedToken;

  if (import.meta.env.DEV) {
    return createDevAuthToken({
      role: "admin",
      displayName: "Frontend Admin",
      userName: "frontend-admin",
    });
  }

  return "";
};

const parseJwtPayload = (token) => {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded;
  } catch (_err) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialToken);
  const user = useMemo(() => parseJwtPayload(token), [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  const setAuthToken = useCallback((nextToken) => {
    setToken(nextToken || "");
  }, []);

  const logout = useCallback(() => {
    setToken("");
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setAuthToken,
      logout,
    }),
    [logout, setAuthToken, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

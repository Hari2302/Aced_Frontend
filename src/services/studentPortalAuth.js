const STUDENT_TOKEN_KEY = "student_token";
const STUDENT_PROFILE_KEY = "student_profile";

export const getStudentToken = () => localStorage.getItem(STUDENT_TOKEN_KEY);

export const setStudentSession = ({ token, student }) => {
  if (token) localStorage.setItem(STUDENT_TOKEN_KEY, token);
  if (student)
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(student));
};

export const clearStudentSession = () => {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
  localStorage.removeItem(STUDENT_PROFILE_KEY);
};

export const getStudentProfile = () => {
  const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
};

export const isStudentAuthenticated = () => Boolean(getStudentToken());

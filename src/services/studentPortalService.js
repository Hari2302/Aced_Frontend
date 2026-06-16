const API_BASE_URL = import.meta.env.VITE_API_URL;
const ATTEMPT_QUEUE_PREFIX = "aced:student-exam-attempt:";

const createRequestId = (examId) => {
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `REQ-EXAM-${examId}-${randomPart}`;
};

const queueKey = (requestId) => `${ATTEMPT_QUEUE_PREFIX}${requestId}`;

const readQueuedAttempts = () => {
  if (typeof localStorage === "undefined") return [];

  return Object.keys(localStorage)
    .filter((key) => key.startsWith(ATTEMPT_QUEUE_PREFIX))
    .map((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

const saveQueuedAttempt = (item) => {
  if (typeof localStorage === "undefined" || !item?.requestId) return;
  localStorage.setItem(
    queueKey(item.requestId),
    JSON.stringify({
      ...item,
      updatedAt: new Date().toISOString(),
    }),
  );
};

const removeQueuedAttempt = (requestId) => {
  if (typeof localStorage === "undefined" || !requestId) return;
  localStorage.removeItem(queueKey(requestId));
};

const portalRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
};

export const studentLogin = async ({ email, mobileNumber }) => {
  return portalRequest("/api/student-portal/login", {
    method: "POST",
    body: JSON.stringify({ email, mobileNumber }),
  });
};

export const getStudentDashboard = async (token) => {
  return portalRequest("/api/student-portal/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStudentExamQuestions = async ({ token, examId }) => {
  return portalRequest(`/api/student-portal/exams/${examId}/questions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const submitStudentExamAttempt = async ({
  token,
  examId,
  answers,
  markedPdfBase64,
  originalFileName,
  requestId,
}) => {
  const stableRequestId = requestId || createRequestId(examId);
  const queuedAttempt = {
    requestId: stableRequestId,
    examId,
    answers,
    markedPdfBase64,
    originalFileName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  saveQueuedAttempt(queuedAttempt);

  try {
    const result = await portalRequest(`/api/student-portal/exams/${examId}/attempts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Request-ID": stableRequestId,
      },
      body: JSON.stringify({ answers, markedPdfBase64, originalFileName }),
    });

    removeQueuedAttempt(stableRequestId);
    return result;
  } catch (err) {
    if (err.status && err.status < 500) {
      removeQueuedAttempt(stableRequestId);
      throw err;
    }

    saveQueuedAttempt({
      ...queuedAttempt,
      status: "pending",
      lastError: err.message || "Submit failed",
    });

    if (!navigator.onLine || err.message === "Failed to fetch") {
      return {
        offline: true,
        requestId: stableRequestId,
        message: "Attempt saved locally and will sync when connection returns.",
      };
    }

    throw err;
  }
};

export const syncPendingStudentExamAttempts = async (token) => {
  if (!token) return [];
  const results = [];

  for (const item of readQueuedAttempts()) {
    if (!item?.examId || !item?.requestId) continue;

    try {
      const result = await portalRequest(
        `/api/student-portal/exams/${item.examId}/attempts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Request-ID": item.requestId,
          },
          body: JSON.stringify({
            answers: item.answers || [],
            markedPdfBase64: item.markedPdfBase64 || "",
            originalFileName: item.originalFileName || "",
          }),
        },
      );

      removeQueuedAttempt(item.requestId);
      results.push({ ...result, examId: item.examId, requestId: item.requestId });
    } catch (err) {
      saveQueuedAttempt({
        ...item,
        status: "pending",
        lastError: err.message || "Sync failed",
      });
    }
  }

  return results;
};

export const getPendingStudentExamAttemptIds = () => {
  return readQueuedAttempts()
    .map((item) => Number(item.examId))
    .filter(Boolean);
};

export const submitStudentExamAttemptDirect = async ({
  token,
  examId,
  answers,
  markedPdfBase64,
  originalFileName,
  requestId,
}) => {
  return portalRequest(`/api/student-portal/exams/${examId}/attempts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Request-ID": requestId || createRequestId(examId),
    },
    body: JSON.stringify({ answers, markedPdfBase64, originalFileName }),
  });
};

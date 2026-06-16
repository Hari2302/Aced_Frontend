export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(`1970-01-01T${String(value).slice(0, 8)}`);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

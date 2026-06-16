import { apiRequest } from "./api";

export const sendAdminChatMessage = async (message) => {
  return apiRequest("/api/chatbot/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

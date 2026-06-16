import { useMemo, useState } from "react";
import { sendAdminChatMessage } from "../../services/chatbotService";
import { useAuth } from "../../hooks/useAuth";

const createWelcomeMessage = (displayName) => ({
  id: `welcome-${Date.now()}`,
  role: "assistant",
  text:
    `Hi ${displayName || "Admin"}, I can answer high-level dashboard questions from live data. ` +
    "Try summary, students, teachers, classes, exams, revenue, or recent activity.",
});

const defaultSuggestions = [
  "Give me dashboard summary",
  "How many active students do we have?",
  "Show teacher and class status",
  "How many exams are available?",
];

const AdminChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    createWelcomeMessage(user?.displayName),
  ]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  const appendMessage = (message) => {
    setMessages((current) => [...current, message]);
  };

  const sendMessage = async (messageText) => {
    const cleanedMessage = String(messageText || "").trim();
    if (!cleanedMessage) return;

    setError("");
    appendMessage({
      id: `user-${Date.now()}`,
      role: "user",
      text: cleanedMessage,
    });
    setInput("");
    setLoading(true);

    try {
      const response = await sendAdminChatMessage(cleanedMessage);
      appendMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response?.reply || "I could not generate a response right now.",
      });

      if (
        Array.isArray(response?.suggestions) &&
        response.suggestions.length > 0
      ) {
        setSuggestions(response.suggestions.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || "Failed to reach admin assistant.");
      appendMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: "I could not complete that request right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="admin-chatbot-shell">
      {isOpen ? (
        <section className="admin-chatbot-panel admin-card" aria-label="Admin assistant">
          <div className="admin-chatbot-header">
            <div>
              <p className="admin-chatbot-kicker">Admin Assistant</p>
              <h2 className="admin-title admin-chatbot-title">
                Dashboard Chatbot
              </h2>
            </div>
            <button type="button" className="admin-chatbot-close admin-action-icon-btn is-close" onClick={() => setIsOpen(false)} aria-label="Close admin assistant" title="Close">
              <img src="/close.svg" alt="" className="admin-action-icon" />
            </button>
          </div>

          <div className="admin-chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`admin-chatbot-bubble ${message.role === "user" ? "is-user" : "is-assistant"}`}>
                <p>{message.text}</p>
              </div>
            ))}
            {loading ? (
              <div className="admin-chatbot-bubble is-assistant">
                <p>Thinking through the dashboard data...</p>
              </div>
            ) : null}
          </div>

          <div className="admin-chatbot-suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="admin-chatbot-chip" onClick={() => sendMessage(suggestion)} disabled={loading}>
                {suggestion}
              </button>
            ))}
          </div>

          {error ? (
            <p className="admin-chatbot-error" role="alert">
              {error}
            </p>
          ) : null}

          <form className="admin-chatbot-form" onSubmit={handleSubmit}>
            <textarea value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about summary, students, teachers, classes, exams, revenue, or activity..." className="admin-chatbot-input" rows={3} />
            <button type="submit" className="admin-primary-btn" disabled={!canSend}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      ) : null}

      <button type="button" className="admin-chatbot-launcher" onClick={() => setIsOpen(current => !current)} aria-expanded={isOpen} aria-label={isOpen ? "Close admin assistant" : "Open admin assistant"} title="Admin assistant">
        <span className="admin-chatbot-launcher-badge" aria-hidden="true" />
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="admin-chatbot-launcher-icon" aria-hidden="true">
          <path d="M8 9.5H16M8 13H13M8.8 19H7C5.89543 19 5 18.1046 5 17V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V17C19 18.1046 18.1046 19 17 19H13.5L9.5 21.5C9.10003 21.75 8.6 21.4624 8.6 20.9908L8.8 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default AdminChatbot;

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../provider/AuthProvider";
import { PATHS } from "../../routes/path";
import chatbotApi from "../../api/chatbotApi";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export default function Chatbot() {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optional: Keep track of last query for retry
  const [lastQuery, setLastQuery] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate(PATHS.LOGIN);
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleSend = useCallback(
    async (query) => {
      if (!query.trim()) return;

      // Reset error on new attempt
      setError(null);
      setLastQuery(query);

      // Optimistic UI: Add user message immediately
      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const data = await chatbotApi.sendChatRequest(query);

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error("Chatbot Error:", err);
        // If auth error, redirect might be handled by interceptors or here
        if (err.status === 401) {
          navigate(PATHS.LOGIN);
          return;
        }
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    if (lastQuery) {
      handleSend(lastQuery);
    }
  }, [handleSend, lastQuery]);

  if (!initialized) {
    return null; // Or a full page loader
  }

  // Double check to prevent flash before redirect
  if (!isAuthenticated) {
    return null;
  }
  return (
    // All devices: Fixed positioning to guarantee full screen (ignoring parent padding & max-width)
    <div className="fixed inset-x-0 bottom-0 top-12 flex flex-col w-full bg-white overflow-hidden z-0">
      {/* Chat Window */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
      />
      {/* Input Area */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}

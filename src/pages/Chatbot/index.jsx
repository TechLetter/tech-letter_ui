import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../provider/AuthProvider";
import { PATHS } from "../../routes/path";
import chatbotApi from "../../api/chatbotApi";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SessionSidebar from "./components/SessionSidebar";
import InsufficientCreditsModal from "../../components/chatbot/InsufficientCreditsModal";

export default function Chatbot() {
  const navigate = useNavigate();
  const { isAuthenticated, initialized, user, updateCredits } = useAuth();

  // 사이드바 토글 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 세션 상태
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // 채팅 상태
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState("");

  // 모달 상태
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // 세션 로드 상태
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // 로그인 체크
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate(PATHS.LOGIN);
    }
  }, [initialized, isAuthenticated, navigate]);

  // 세션 목록 로드 콜백
  const handleSessionsLoaded = useCallback((loadedSessions) => {
    setSessions(loadedSessions);
  }, []);

  // 세션 선택 시 메시지 로드
  const handleSelectSession = useCallback(
    async (sessionId) => {
      if (sessionId === currentSessionId) return;

      setCurrentSessionId(sessionId);
      setMessages([]);
      setError(null);
      setIsLoadingSession(true);

      try {
        const session = await chatbotApi.getSessionDetail(sessionId);
        const formattedMessages = (session.messages || []).map((msg, idx) => ({
          id: `${sessionId}-${idx}`,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at,
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("세션 로드 실패:", err);
        setError(err);
      } finally {
        setIsLoadingSession(false);
      }
    },
    [currentSessionId]
  );

  // 새 채팅 시작
  const handleNewChat = useCallback(async () => {
    try {
      const newSession = await chatbotApi.createSession();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("세션 생성 실패:", err);
    }
  }, []);

  // 세션 삭제
  const handleDeleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
    [currentSessionId]
  );

  // 메시지 전송
  const handleSend = useCallback(
    async (query) => {
      if (!query.trim()) return;

      setError(null);
      setLastQuery(query);

      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const data = await chatbotApi.sendChatRequest(query, currentSessionId);

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (data.remaining_credits !== undefined) {
          updateCredits(data.remaining_credits);
        }

        if (currentSessionId) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    title:
                      query.slice(0, 30) + (query.length > 30 ? "..." : ""),
                  }
                : s
            )
          );
        }
      } catch (err) {
        console.error("Chatbot Error:", err);

        if (err.status === 401) {
          navigate(PATHS.LOGIN);
          return;
        }

        if (err.code === "insufficient_credits" || err.status === 402) {
          setShowCreditsModal(true);
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }

        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, navigate, updateCredits]
  );

  // 재시도
  const handleRetry = useCallback(() => {
    if (lastQuery) {
      handleSend(lastQuery);
    }
  }, [handleSend, lastQuery]);

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-12 flex w-full bg-white dark:bg-slate-900 transition-colors duration-300 z-0">
      {/* 세션 사이드바 */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onSessionsLoaded={handleSessionsLoaded}
        credits={user?.credits}
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
      />

      {/* 채팅 영역 - 사이드바 열림 상태에 따라 마진 조정 */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${isSidebarOpen ? "md:ml-64" : "md:ml-0"}
        `}
      >
        {isLoadingSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* 크레딧 부족 모달 */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </div>
  );
}

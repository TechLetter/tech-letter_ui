import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PATHS } from "../../routes/path";
import chatApi from "../../api/chatApi";
import { ErrorCode, toApiError } from "../../api/apiError";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SessionSidebar from "./components/SessionSidebar";
import InsufficientCreditsModal from "../../components/chatbot/InsufficientCreditsModal";
import { RiAddLine, RiMenuLine } from "react-icons/ri";

// 메시지 메타데이터는 `metadata` 로 중첩되지 않고 평탄화되어 온다.
const buildMessageFromSession = (sessionId, msg, idx) => ({
  id: `${sessionId}-${idx}`,
  role: msg.role,
  content: msg.content,
  createdAt: msg.created_at,
  sources: msg.sources || [],
  agent: msg.agent || null,
  guard: msg.guard || null,
  memory: msg.memory || null,
});

const mergeActivity = (activities = [], nextActivity) => {
  const nextActivities = [...activities];
  const exactIndex = nextActivities.findIndex(
    (activity) =>
      activity.type === nextActivity.type && activity.label === nextActivity.label
  );
  const runningIndex = nextActivities.findIndex(
    (activity) =>
      activity.type === nextActivity.type && activity.status === "running"
  );
  const targetIndex = exactIndex >= 0 ? exactIndex : runningIndex;

  if (targetIndex >= 0) {
    nextActivities[targetIndex] = nextActivity;
    return nextActivities;
  }
  return [...nextActivities, nextActivity];
};

export default function Chatbot() {
  const navigate = useNavigate();
  const { isAuthenticated, initialized, user, updateCredits } = useAuth();
  const hasAutoSelectedSessionRef = useRef(false);

  // 사이드바 토글 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 세션 상태
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // 채팅 상태
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // 입력창 제어
  const [inputValue, setInputValue] = useState("");

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

  useEffect(() => {
    if (!initialized || !isAuthenticated) {
      return;
    }

    const loadSuggestedQuestions = async () => {
      try {
        const questions = await chatApi.getSuggestedQuestions();
        setSuggestedQuestions(
          (questions || [])
            .filter((question) => question?.text)
            .map((question) => question.text)
        );
      } catch (err) {
        console.error("추천 질문 로드 실패:", err);
        setSuggestedQuestions([]);
      }
    };

    loadSuggestedQuestions();
  }, [initialized, isAuthenticated]);

  // 세션 목록 로드 콜백
  const handleSessionsLoaded = useCallback((loadedSessions) => {
    setSessions(
      loadedSessions.map((session) => ({
        ...session,
        isEmptySession: false,
      }))
    );
  }, []);

  // 빈 세션 찾기 (메시지가 없는 세션)
  const findEmptySession = useCallback(() => {
    return sessions.find((s) => s.isEmptySession);
  }, [sessions]);

  // 현재 세션이 빈 세션인지 확인
  const isCurrentSessionEmpty = messages.length === 0;
  const hasStreamingMessage = messages.some((message) => message.isStreaming);
  const currentSession = sessions.find((session) => session.id === currentSessionId);

  // 세션 선택 시 메시지 로드
  const handleSelectSession = useCallback(
    async (sessionId) => {
      if (sessionId === currentSessionId) return;

      setCurrentSessionId(sessionId);
      setMessages([]);
      setError(null);
      setIsLoadingSession(true);

      try {
        const session = await chatApi.getSessionDetail(sessionId);
        const formattedMessages = (session.messages || []).map((msg, idx) =>
          buildMessageFromSession(sessionId, msg, idx)
        );
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  ...session,
                  isEmptySession: formattedMessages.length === 0,
                }
              : s
          )
        );
        setMessages(formattedMessages);
      } catch (err) {
        console.error("세션 로드 실패:", err);
        setError(toApiError(err));
      } finally {
        setIsLoadingSession(false);
      }
    },
    [currentSessionId]
  );

  useEffect(() => {
    if (
      hasAutoSelectedSessionRef.current ||
      currentSessionId ||
      sessions.length === 0 ||
      isLoadingSession
    ) {
      return;
    }

    const latestSession = sessions[0];
    if (!latestSession?.id) {
      return;
    }

    hasAutoSelectedSessionRef.current = true;
    handleSelectSession(latestSession.id);
  }, [currentSessionId, handleSelectSession, isLoadingSession, sessions]);

  // 새 채팅 시작 - 빈 세션이 있으면 재사용
  const handleNewChat = useCallback(async () => {
    // 이미 빈 세션을 보고 있다면 아무것도 하지 않음
    if (currentSessionId && isCurrentSessionEmpty) {
      return;
    }

    // 기존 빈 세션 찾기
    const emptySession = findEmptySession();
    if (emptySession) {
      setCurrentSessionId(emptySession.id);
      setMessages([]);
      setError(null);
      return;
    }

    // 빈 세션이 없으면 새로 생성
    try {
      const newSession = await chatApi.createSession();
      setSessions((prev) => [{ ...newSession, isEmptySession: true }, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("세션 생성 실패:", err);
    }
  }, [currentSessionId, isCurrentSessionEmpty, findEmptySession]);

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

  // 추천 질문 선택
  const handleSuggestedQuestion = useCallback((question) => {
    setInputValue(question);
  }, []);

  // 메시지 전송
  const handleSend = useCallback(
    async (query) => {
      if (!query.trim()) return;

      setError(null);
      setLastQuery(query);
      setInputValue(""); // 입력창 초기화

      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // 세션이 없으면 새 세션 생성
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const newSession = await chatApi.createSession();
          setSessions((prev) => [
            { ...newSession, isEmptySession: true },
            ...prev,
          ]);
          setCurrentSessionId(newSession.id);
          sessionId = newSession.id;
        } catch (err) {
          console.error("세션 생성 실패:", err);
          setError(toApiError(err));
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          setIsLoading(false);
          return;
        }
      }

      const botMessageId = (Date.now() + 1).toString();
      const streamingBotMsg = {
        id: botMessageId,
        role: "assistant",
        content: "",
        sources: [],
        agent: {
          mode: "stream",
          intent: "pending",
          activities: [
            {
              type: "guard",
              label: "질문 안전성 확인",
              status: "running",
            },
          ],
        },
        guard: null,
        memory: null,
        isStreaming: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, streamingBotMsg]);

      try {
        const data = await chatApi.streamChatRequest(query, sessionId, {
          onActivity: (activity) => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === botMessageId
                  ? {
                      ...message,
                      agent: {
                        ...(message.agent || {}),
                        activities: mergeActivity(
                          message.agent?.activities,
                          activity
                        ),
                      },
                    }
                  : message
              )
            );
          },
        });

        const botMsg = {
          id: botMessageId,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          agent: data.agent || null,
          guard: data.guard || null,
          memory: data.memory || null,
          isStreaming: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) =>
          prev.map((message) => (message.id === botMessageId ? botMsg : message))
        );

        if (data.credits) {
          updateCredits(data.credits);
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  title: query.slice(0, 30) + (query.length > 30 ? "..." : ""),
                  isEmptySession: false,
                }
              : s
          )
        );
      } catch (err) {
        console.error("Chatbot Error:", err);

        if (err.code === ErrorCode.AUTH_REQUIRED || err.code === ErrorCode.AUTH_INVALID_TOKEN) {
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
          navigate(PATHS.LOGIN);
          return;
        }

        if (err.code === ErrorCode.CREDIT_INSUFFICIENT) {
          setShowCreditsModal(true);
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
          return;
        }

        if (err.code === ErrorCode.POLICY_BLOCKED) {
          setInputValue(query);
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== botMessageId));
        }

        setError(toApiError(err));
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
    <div className="fixed inset-x-0 bottom-0 top-12 z-40 flex w-full overflow-hidden bg-white transition-colors duration-300 dark:bg-slate-900">
      {/* 세션 사이드바 */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onSessionsLoaded={handleSessionsLoaded}
        credits={user?.credits?.remaining}
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        onMobileOpenChange={setIsMobileSidebarOpen}
      />

      {/* 채팅 영역 - 사이드바 열림 상태에 따라 마진 조정 */}
      <div
        className={`
          flex min-w-0 flex-1 flex-col transition-all duration-300
          ${isSidebarOpen ? "md:ml-64" : "md:ml-0"}
        `}
      >
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            aria-label="채팅 기록 열기"
          >
            <RiMenuLine className="text-xl" />
          </button>
          <div className="min-w-0 px-3 text-center">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {currentSession?.title || "AI 챗봇"}
            </div>
            {user?.credits && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                남은 크레딧 {user.credits.remaining}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm active:scale-95"
            aria-label="새 채팅"
          >
            <RiAddLine className="text-xl" />
          </button>
        </div>

        {isLoadingSession ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <ChatWindow
              messages={messages}
              isLoading={isLoading && !hasStreamingMessage}
              error={error}
              onRetry={handleRetry}
              suggestedQuestions={
                isCurrentSessionEmpty ? suggestedQuestions : null
              }
              onSuggestedQuestion={handleSuggestedQuestion}
            />
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              value={inputValue}
              onChange={setInputValue}
            />
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

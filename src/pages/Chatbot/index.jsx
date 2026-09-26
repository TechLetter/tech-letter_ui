import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRequireLogin } from "../../hooks/useLoginGate";
import { showLoginRequiredModal } from "../../provider/loginRequiredModalBridge";
import chatApi from "../../api/chatApi";
import { ErrorCode, toApiError } from "../../api/apiError";
import llmModelsApi from "../../api/llmModelsApi";
import { isSelectableModel, sortModelsByHealth } from "../../utils/modelHealth";
import CreditsBadge from "../../components/chatbot/CreditsBadge";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SessionSidebar from "./components/SessionSidebar";
import InsufficientCreditsModal from "../../components/chatbot/InsufficientCreditsModal";
import { RiAddLine, RiMenuLine } from "react-icons/ri";

const CHAT_MODEL_STORAGE_KEY = "techletter.chat.model";

const readStoredChatModel = () => {
  try {
    return window.localStorage.getItem(CHAT_MODEL_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const persistChatModel = (modelId) => {
  try {
    if (modelId) {
      window.localStorage.setItem(CHAT_MODEL_STORAGE_KEY, modelId);
    } else {
      window.localStorage.removeItem(CHAT_MODEL_STORAGE_KEY);
    }
  } catch {
    // 사이트 데이터 접근이 막혀도 현재 화면의 선택은 계속 사용할 수 있어야 한다.
  }
};

// 상태 판정·정렬은 modelHealth.js 가 담당한다(어드민 화면과 동일 기준을 쓴다).
// 여기서는 model_id 중복 제거와 문자열 다듬기만 한다 — 원본 헬스 필드는
// 그대로 들고 있어야 드롭다운이 LED·uptime·지연을 보여줄 수 있다.
const normalizeHealthItems = (items) => {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const rawModelId = typeof item === "string" ? item : item?.model_id;
      if (typeof rawModelId !== "string") return null;

      const modelId = rawModelId.trim();
      if (!modelId || seen.has(modelId)) return null;

      seen.add(modelId);
      return typeof item === "string" ? { model_id: modelId } : { ...item, model_id: modelId };
    })
    .filter(Boolean);
};

// 메시지 메타데이터는 `metadata` 로 중첩되지 않고 평탄화되어 온다.
const buildMessageFromSession = (sessionId, msg, idx) => ({
  id: `${sessionId}-${idx}`,
  role: msg.role,
  content: msg.content,
  createdAt: msg.created_at,
  sources: msg.sources || [],
  agent: msg.agent || null,
  guard: msg.guard || null,
});

export default function Chatbot() {
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
  const [selectedModelId, setSelectedModelId] = useState(readStoredChatModel);
  const [modelOptions, setModelOptions] = useState([]);
  const [modelCatalogStatus, setModelCatalogStatus] = useState("idle");

  // 모달 상태
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // 세션 로드 상태
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // 로그인 체크 — 비로그인이면 홈으로 돌리고 로그인 모달.
  const requireLogin = useRequireLogin();
  useEffect(() => {
    requireLogin();
  }, [requireLogin]);

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

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let ignore = false;
    setModelCatalogStatus("loading");

    llmModelsApi
      .getModels()
      .then((response) => {
        if (ignore) return;
        setModelOptions(normalizeHealthItems(response?.data?.items));
        setModelCatalogStatus("loaded");
      })
      .catch(() => {
        if (ignore) return;
        setModelOptions([]);
        setModelCatalogStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [initialized, isAuthenticated]);

  const handleModelChange = useCallback((modelId) => {
    const nextModelId = typeof modelId === "string" ? modelId.trim() : "";
    setSelectedModelId(nextModelId);
    persistChatModel(nextModelId);
  }, []);

  // "자동" 이라는 별도 항목을 목록에 보여주는 대신, 처음 열었을 때나 고른
  // 모델이 카탈로그에서 사라졌을 때 지금 제일 상태 좋은 모델로 조용히
  // 채워 넣는다 — 사용자는 항상 실제 모델 이름 하나가 선택된 상태만 본다.
  // 목록 조회 자체가 실패했을 때는(에러) 판단할 근거가 없으니 지금 값을
  // 그대로 둔다.
  useEffect(() => {
    if (modelCatalogStatus !== "loaded") return;

    // 고른 모델이 사용 불가가 돼도 바꾼다 — 그대로 두면 매번 폴백 모델이 답한다.
    const isAvailable =
      selectedModelId &&
      modelOptions.some(
        (option) => option.model_id === selectedModelId && isSelectableModel(option)
      );
    if (isAvailable) return;

    const autoPick = sortModelsByHealth(modelOptions).find(isSelectableModel)?.model_id;
    if (autoPick) handleModelChange(autoPick);
  }, [handleModelChange, modelCatalogStatus, modelOptions, selectedModelId]);

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

      const requestedModelId = selectedModelId;
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
        agent: null,
        guard: null,
        requestedModelId: requestedModelId || null,
        isStreaming: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, streamingBotMsg]);

      try {
        const data = await chatApi.streamChatRequest(query, sessionId, {
          modelId: requestedModelId || undefined,
        });

        const botMsg = {
          id: botMessageId,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          agent: data.agent || null,
          guard: data.guard || null,
          requestedModelId: requestedModelId || null,
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
        const apiError = toApiError(err);

        if (
          apiError.code === ErrorCode.AUTH_REQUIRED ||
          apiError.code === ErrorCode.AUTH_INVALID_TOKEN
        ) {
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
          // 대화 중 로그인이 풀렸다. 쓰던 화면은 두고 로그인 모달만 띄운다.
          showLoginRequiredModal();
          return;
        }

        if (apiError.code === ErrorCode.CREDIT_INSUFFICIENT) {
          setShowCreditsModal(true);
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
          return;
        }

        if (apiError.code === ErrorCode.REQUEST_INVALID && apiError.field === "model_id") {
          handleModelChange("");
        }

        if (apiError.code === ErrorCode.POLICY_BLOCKED) {
          setInputValue(query);
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMsg.id && m.id !== botMessageId)
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== botMessageId));
        }

        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, handleModelChange, selectedModelId, updateCredits]
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
    <div className="fixed inset-x-0 top-(--tl-header-h) bottom-0 z-40 flex w-full overflow-hidden bg-white transition-colors duration-300 dark:bg-slate-900">
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
              <CreditsBadge
                credits={user.credits.remaining}
                className="mt-0.5 px-2 py-0 text-[11px]"
              />
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
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              suggestedQuestions={
                isCurrentSessionEmpty ? suggestedQuestions : null
              }
              onSuggestedQuestion={handleSuggestedQuestion}
              models={modelOptions}
            />
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              value={inputValue}
              onChange={setInputValue}
              modelOptions={modelOptions}
              selectedModelId={selectedModelId}
              onModelChange={handleModelChange}
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

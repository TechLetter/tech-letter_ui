import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiAddLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiCoinLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import chatApi from "../../../api/chatApi";
import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { PATHS } from "../../../routes/path";
import { classifyModelHealth } from "../../../utils/modelHealth";
import { displayName } from "../../../utils/modelName";

const CARD = "flex min-h-0 flex-col rounded-xl border border-line bg-surface p-3";

/**
 * SessionSidebar - 대화 목록 + 크레딧·모델 카드.
 * 데스크톱: 좌측 248px 고정. 모바일: 햄버거로 여는 좌측 드로어.
 */
export default function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSessionsLoaded,
  credits,
  selectedModel,
  isMobileOpen = false,
  onMobileOpenChange,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 세션 목록 로드
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const data = await chatApi.getSessionList();
        onSessionsLoaded(data.items || []);
      } catch (error) {
        console.error("세션 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [onSessionsLoaded]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onMobileOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileOpen, onMobileOpenChange]);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(sessionId);
    try {
      await chatApi.deleteSession(sessionId);
      onDeleteSession(sessionId);
    } catch (error) {
      console.error("세션 삭제 실패:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    onMobileOpenChange?.(false);
  };

  const handleNewChat = () => {
    onNewChat();
    onMobileOpenChange?.(false);
  };

  const modelName = selectedModel ? displayName(selectedModel).name : "";
  const uptime = typeof selectedModel?.uptime_24h === "number" ? `${selectedModel.uptime_24h.toFixed(1)}%` : "";
  const latency =
    typeof selectedModel?.avg_latency_ms === "number"
      ? selectedModel.avg_latency_ms >= 1000
        ? `${(selectedModel.avg_latency_ms / 1000).toFixed(1)}s`
        : `${Math.round(selectedModel.avg_latency_ms)}ms`
      : "";

  const rowClass = (on) =>
    `group flex h-11 items-center gap-1 rounded-lg pr-1 pl-2.5 lg:h-10 ${on ? "bg-accent-soft" : "hover:bg-canvas"}`;

  const content = (dense) => (
    <div className={`flex h-full min-h-0 flex-col ${dense ? "gap-4" : "gap-3"}`}>
      <section className={`${CARD} flex-1`}>
        <div className="mb-2 flex h-6 shrink-0 items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-ink">대화</span>
          {sessions.length > 0 && <span className="font-mono text-xs text-ink-3">({sessions.length})</span>}
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-accent bg-accent-soft text-[13px] font-semibold text-accent-ink hover:opacity-90 lg:h-9"
        >
          <RiAddLine className="h-4 w-4" />새 대화
        </button>
        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-3">대화 없음</p>
          ) : (
            sessions.map((session) => {
              const on = session.id === currentSessionId;
              return (
                <div key={session.id} className={rowClass(on)}>
                  <button
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className={`min-w-0 flex-1 truncate text-left text-[13px] ${
                      on ? "font-semibold text-accent-ink" : "font-medium text-ink"
                    }`}
                  >
                    {session.title || "새 대화"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, session.id)}
                    disabled={deletingId === session.id}
                    aria-label="대화 삭제"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md lg:h-8 lg:w-8 ${
                      on ? "text-accent-ink" : "text-ink-3 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    } hover:bg-canvas disabled:opacity-40`}
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className={`${CARD} shrink-0 gap-1`}>
        <div className="flex h-7 items-center gap-2">
          <RiCoinLine className="h-4 w-4 text-ink-3" />
          <span className="text-[13px] font-semibold text-ink">크레딧</span>
          <span className="flex-1" />
          <span className="font-mono text-sm text-ink">{typeof credits === "number" ? `(${credits})` : "–"}</span>
        </div>
        {selectedModel && (
          <div className="flex h-7 items-center gap-2">
            <span className="flex w-4 justify-center">
              <ModelStatusDot level={classifyModelHealth(selectedModel)} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink" title={selectedModel.model_id}>
              {modelName}
            </span>
            {(latency || uptime) && (
              <span className="font-mono text-[11px] text-ink-3">{[latency, uptime].filter(Boolean).join(" · ")}</span>
            )}
          </div>
        )}
        <Link to={PATHS.MODEL_STATUS} className="flex h-7 items-center gap-0.5">
          <span className="text-xs font-semibold text-accent-ink">모델 상태 보기</span>
          <RiArrowRightSLine className="h-3.5 w-3.5 text-accent-ink" />
        </Link>
      </section>
    </div>
  );

  return (
    <>
      {/* 데스크톱 */}
      <aside aria-label="대화 목록" className="hidden w-[248px] shrink-0 lg:block">
        {content(true)}
      </aside>

      {/* 모바일 드로어 */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onMobileOpenChange?.(false)}
            className="absolute inset-0 bg-black/50"
          />
          <section
            role="dialog"
            aria-label="대화 목록"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-3rem))] animate-slideInLeft flex-col bg-canvas"
          >
            <div className="flex h-14 shrink-0 items-center border-b border-line bg-surface pr-2 pl-5">
              <h2 className="flex-1 text-[17px] font-bold text-ink">대화</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => onMobileOpenChange?.(false)}
                className="flex h-11 w-11 items-center justify-center text-ink-2"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {content(false)}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

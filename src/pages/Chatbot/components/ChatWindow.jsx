import { useEffect, useRef } from "react";
import { chatErrorMessage } from "../../../api/chatApi";
import { ErrorCode } from "../../../api/apiError";
import MessageBubble from "./MessageBubble";
import SecurityNotice from "./SecurityNotice";
import { RiRefreshLine } from "react-icons/ri";

/**
 * ChatWindow 컴포넌트
 * 메시지 목록, 빈 상태(추천 질문), 로딩·에러 표시
 */
export default function ChatWindow({
  messages,
  isLoading,
  error,
  onRetry,
  suggestedQuestions,
  onSuggestedQuestion,
  models,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const showEmptyState = messages.length === 0 && !error;

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex min-h-full w-full max-w-[860px] flex-col px-4 pt-3 pb-2 lg:px-0 lg:pt-2">
        {/* 빈 상태 — 추천 질문 */}
        {showEmptyState && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 opacity-0 animate-fadeIn" style={{ animationFillMode: "forwards" }}>
            <img src="/tech-letter-favicon.svg" alt="" width={40} height={40} className="h-10 w-10" />
            {suggestedQuestions && suggestedQuestions.length > 0 && (
              <>
                <span className="text-[13px] font-semibold text-ink-3">추천 질문 ({suggestedQuestions.length})</span>
                <div className="flex w-full max-w-[640px] flex-col gap-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSuggestedQuestion?.(question)}
                      className="min-h-11 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left text-sm leading-relaxed text-ink hover:border-accent hover:bg-canvas"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="flex flex-1 flex-col">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} models={models} />
          ))}

          {/* 로딩 표시 */}
          {isLoading && (
            <div className="mb-6 flex gap-1 pl-10">
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: "300ms" }} />
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="my-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900/60 dark:bg-rose-950/40">
              <SecurityNotice error={error} />
              <p className="mb-2 text-sm text-rose-700 dark:text-rose-300">{chatErrorMessage(error)}</p>
              {onRetry && error.code !== ErrorCode.REQUEST_INVALID && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink-2 hover:bg-canvas"
                >
                  <RiRefreshLine /> 다시 시도
                </button>
              )}
            </div>
          )}
        </div>

        <div ref={bottomRef} className="pb-2" />
      </div>
    </div>
  );
}

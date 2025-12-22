import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { RiRobot2Line, RiRefreshLine, RiLightbulbLine } from "react-icons/ri";

/**
 * ChatWindow 컴포넌트
 * 메시지 목록, 빈 상태, 추천 질문 표시
 *
 * @param {Object} props
 */
export default function ChatWindow({
  messages,
  isLoading,
  error,
  onRetry,
  suggestedQuestions,
  onSuggestedQuestion,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const showEmptyState = messages.length === 0 && !error;

  return (
    <div className="flex-1 w-full overflow-y-auto">
      <div className="mx-auto w-full max-w-full sm:max-w-2xl lg:max-w-4xl min-h-full flex flex-col pt-4 sm:pt-6 pb-2">
        {/* 빈 상태 */}
        {showEmptyState && (
          <div
            className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-0 animate-fadeIn"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="mb-6 rounded-full bg-slate-100 p-6 shadow-inner dark:bg-slate-800 dark:shadow-slate-900/50">
              <RiRobot2Line className="text-6xl text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-200">
              무엇을 도와드릴까요?
            </h2>
            <p className="text-slate-500 max-w-xs text-sm sm:text-base dark:text-slate-400 mb-6">
              궁금한 내용을 입력하시면 AI가 답변해 드립니다.
            </p>

            {/* 추천 질문 */}
            {suggestedQuestions && suggestedQuestions.length > 0 && (
              <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-1.5 mb-3 text-slate-400 dark:text-slate-500">
                  <RiLightbulbLine className="text-amber-500" />
                  <span className="text-xs font-medium">추천 질문</span>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestedQuestion?.(question)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="flex-1 flex flex-col px-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* 로딩 표시 */}
          {isLoading && (
            <div className="w-full mb-6">
              <div className="flex gap-1 pl-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce dark:bg-slate-500"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce dark:bg-slate-500"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce dark:bg-slate-500"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="my-4 p-4 bg-red-50 rounded-xl text-center mx-4 dark:bg-red-900/20">
              <p className="text-red-800 text-sm mb-2 dark:text-red-300">
                {error.message || "오류가 발생했습니다."}
              </p>
              {onRetry && error.code !== "invalid_request" && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 rounded-md text-red-600 text-sm hover:bg-red-50 dark:bg-slate-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
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

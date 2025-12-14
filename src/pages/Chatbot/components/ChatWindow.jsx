import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { RiRobot2Line, RiRefreshLine } from "react-icons/ri";

/**
 * ChatWindow 컴포넌트
 * 불필요한 컨테이너 패딩 제거, 시원한 뷰 제공.
 *
 * @param {Object} props
 */
export default function ChatWindow({ messages, isLoading, error, onRetry }) {
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
            className="flex-5 flex flex-col items-center justify-center text-center opacity-0 animate-fadeIn"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="mb-6 rounded-full bg-slate-100 p-6 shadow-inner">
              <RiRobot2Line className="text-6xl text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              무엇을 도와드릴까요?
            </h2>
            <p className="text-slate-500 max-w-xs text-sm sm:text-base">
              궁금한 내용을 입력하시면 AI가 답변해 드립니다.
            </p>
          </div>
        )}

        {/* 메시지 목록 (여기서 개별 메시지에 패딩이나 max-width 적용) */}
        <div className="flex-1 flex flex-col px-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* 로딩 표시 (심플하게) */}
          {isLoading && (
            <div className="w-full mb-6">
              <div className="flex gap-1 pl-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="my-4 p-4 bg-red-50 rounded-xl text-center mx-4">
              <p className="text-red-800 text-sm mb-2">
                {error.message || "오류가 발생했습니다."}
              </p>
              {onRetry && error.code !== "invalid_request" && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 rounded-md text-red-600 text-sm hover:bg-red-50"
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

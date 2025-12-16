import { useState, useRef, useEffect } from "react";
import { RiArrowUpLine, RiLoader4Line } from "react-icons/ri"; // 아이콘 복구 (ArrowUp)

/**
 * ChatInput 컴포넌트
 * ChatGPT 모바일 스타일: 둥근 알약(Pill) 형태, 회색 배경.
 *
 * @param {Object} props
 */
export default function ChatInput({ onSend, isLoading, maxLength = 2000 }) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = query.trim();
    if (!trimmed) return;
    if (query.length > maxLength) return;

    onSend(trimmed);
    setQuery("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isOverLimit = query.length > maxLength;
  const isSendable = query.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <div className="w-full bg-white p-2 sm:pb-8 dark:bg-slate-900 transition-colors duration-300">
      <div className="mx-auto max-w-full sm:max-w-2xl lg:max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className={`
            relative flex items-end gap-2 w-full px-4 py-2.5 rounded-[26px] bg-[#f4f4f4] transition-colors duration-200
            dark:bg-slate-800
            ${
              isOverLimit
                ? "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20 dark:ring-red-500"
                : "focus-within:bg-[#eaeaea] dark:focus-within:bg-slate-700"
            }
          `}
        >
          {/* 입력창 (둥근 아이콘 모양 추가 가능) */}
          {/* <button type="button" className="text-slate-400 p-1 rounded-full bg-slate-200 mr-2"><BsPlusLg/></button> (옵션: + 버튼) */}

          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOverLimit ? "글자 수 초과" : "무엇이든 물어보세요!"}
            rows={1}
            disabled={isLoading}
            className={`
              flex-1 w-full bg-transparent border-0 p-1 text-slate-800 placeholder:text-slate-500 
              focus:ring-0 focus:outline-none resize-none text-[16px] leading-6 max-h-[150px]
              dark:text-slate-100 dark:placeholder:text-slate-400
              ${isOverLimit ? "text-red-700 dark:text-red-400" : ""}
            `} // text-[16px]는 iOS에서 줌인 방지
            style={{ minHeight: "24px" }}
          />

          {/* 전송 버튼 (원형, 검은색/회색) */}
          <button
            type="submit"
            disabled={!isSendable}
            className={`
              flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 mb-0.5
              ${
                isSendable
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg active:scale-95"
                  : "bg-[#d7d7d7] text-white cursor-not-allowed" // 비활성 시 더 연한 회색
              }
            `}
          >
            {isLoading ? (
              <RiLoader4Line className="animate-spin text-lg" />
            ) : (
              <RiArrowUpLine className="text-xl font-bold" />
            )}
          </button>
        </form>

        {/* 경고 문구 (평소엔 숨김, 에러 시에만) */}
        {isOverLimit && (
          <p className="text-center mt-1 text-xs text-red-500 font-bold">
            {query.length}/{maxLength}자 (제한 초과)
          </p>
        )}
      </div>
    </div>
  );
}

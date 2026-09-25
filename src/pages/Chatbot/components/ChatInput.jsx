import { useRef, useEffect } from "react";
import { RiArrowDownSLine, RiArrowUpLine, RiLoader4Line } from "react-icons/ri";
import ModelDropdown from "../../../components/common/ModelDropdown";
import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { classifyModelHealth } from "../../../utils/modelHealth";
import { displayName } from "../../../utils/modelName";

/**
 * ChatInput 컴포넌트
 * ChatGPT 모바일 스타일: 둥근 알약(Pill) 형태, 회색 배경.
 * 외부에서 value 제어 가능 (추천 질문 선택 시)
 *
 * @param {Object} props
 */
export default function ChatInput({
  onSend,
  isLoading,
  maxLength = 2000,
  value = "",
  onChange,
  modelOptions = [],
  selectedModelId = "",
  onModelChange,
}) {
  const textareaRef = useRef(null);

  // 외부 value와 동기화 (제어 컴포넌트)
  const query = value;
  const setQuery = onChange || (() => {});
  const setModel = onModelChange || (() => {});

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [query]);

  // 외부에서 값이 설정되면 포커스
  useEffect(() => {
    if (value && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value]);

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
  const selectedModel = modelOptions.find((option) => option.model_id === selectedModelId);
  const isSendable = query.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <div className="w-full flex-shrink-0 border-t border-slate-100 bg-white px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:px-4 sm:pb-6">
      <div className="mx-auto w-full max-w-3xl lg:max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className={`
            relative flex w-full items-end gap-2 rounded-2xl bg-[#f4f4f4] px-3 py-2.5 transition-colors duration-200 sm:rounded-[26px] sm:px-4
            dark:bg-slate-800
            ${
              isOverLimit
                ? "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20 dark:ring-red-500"
                : "focus-within:bg-[#eaeaea] dark:focus-within:bg-slate-700"
            }
          `}
        >
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOverLimit ? "글자 수 초과" : "무엇이든 물어보세요!"}
            rows={1}
            disabled={isLoading}
            className={`
              min-w-0 flex-1 w-full bg-transparent border-0 p-1 text-slate-800 placeholder:text-slate-500
              focus:ring-0 focus:outline-none resize-none text-[16px] leading-6 max-h-[35vh] sm:max-h-[150px]
              dark:text-slate-100 dark:placeholder:text-slate-400
              ${isOverLimit ? "text-red-700 dark:text-red-400" : ""}
            `}
            style={{ minHeight: "24px" }}
          />

          <ModelDropdown
            options={modelOptions}
            onSelect={setModel}
            selectedId={selectedModelId}
            placement="top"
            align="right"
            disabled={isLoading}
            selectableOnly
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                disabled={isLoading}
                aria-label="답변 모델 선택"
                aria-expanded={open}
                title={selectedModelId}
                className="mb-0.5 flex h-9 flex-shrink-0 items-center gap-1 rounded-full bg-black/5 px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 sm:h-8 sm:max-w-[11.5rem] sm:px-2.5"
              >
                {selectedModel && <ModelStatusDot level={classifyModelHealth(selectedModel)} />}
                {/* 모바일에선 모델명이 입력창 자리를 너무 뺏어서, 점+화살표만
                    남기고 이름은 데스크톱(sm+)에서만 보여준다. */}
                <span className="hidden min-w-0 truncate sm:inline">
                  {selectedModel ? displayName(selectedModel).name : selectedModelId || "모델"}
                </span>
                <RiArrowDownSLine className="shrink-0 text-sm" />
              </button>
            )}
          />

          <button
            type="submit"
            disabled={!isSendable}
            className={`
              mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 sm:h-8 sm:w-8
              ${
                isSendable
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg active:scale-95"
                  : "bg-[#d7d7d7] text-white cursor-not-allowed dark:bg-slate-600 dark:text-slate-400"
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

        {isOverLimit && (
          <p className="text-center mt-1 text-xs text-red-500 font-bold">
            {query.length}/{maxLength}자 (제한 초과)
          </p>
        )}
      </div>
    </div>
  );
}

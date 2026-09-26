import { useRef, useEffect } from "react";
import { RiArrowDownSLine, RiArrowUpLine, RiLoader4Line } from "react-icons/ri";
import ModelDropdown from "../../../components/common/ModelDropdown";
import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { classifyModelHealth } from "../../../utils/modelHealth";
import { displayName } from "../../../utils/modelName";

/**
 * ChatInput 컴포넌트
 * 질문 입력 + 모델 선택 + 글자 수 + 보내기. 외부에서 value 를 제어한다(추천 질문·검색어).
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

  const query = value;
  const setQuery = onChange || (() => {});
  const setModel = onModelChange || (() => {});

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
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
    <div className="w-full shrink-0 border-t border-line bg-surface px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0">
      <div className="mx-auto w-full max-w-[860px]">
        <form
          onSubmit={handleSubmit}
          className={`flex w-full flex-col gap-1.5 rounded-2xl border bg-surface px-3.5 pt-2.5 pb-2 ${
            isOverLimit ? "border-rose-400" : "border-line focus-within:border-accent"
          }`}
        >
          <label htmlFor="chat-input" className="sr-only">
            질문
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문"
            rows={1}
            disabled={isLoading}
            className={`max-h-[35vh] w-full min-w-0 resize-none border-0 bg-transparent p-0.5 text-[16px] leading-6 outline-none placeholder:text-ink-3 sm:max-h-[150px] ${
              isOverLimit ? "text-rose-600 dark:text-rose-300" : "text-ink"
            }`}
            style={{ minHeight: "24px" }}
          />

          <div className="flex items-center gap-2">
            <ModelDropdown
              options={modelOptions}
              onSelect={setModel}
              selectedId={selectedModelId}
              placement="top"
              align="left"
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
                  className="flex h-8 max-w-[12rem] shrink-0 items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 text-xs font-semibold text-ink-2 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedModel && <ModelStatusDot level={classifyModelHealth(selectedModel)} />}
                  <span className="min-w-0 truncate">
                    {selectedModel ? displayName(selectedModel).name : selectedModelId || "모델"}
                  </span>
                  <RiArrowDownSLine className="h-3.5 w-3.5 shrink-0" />
                </button>
              )}
            />
            <span className="flex-1" />
            <span className={`font-mono text-[11px] ${isOverLimit ? "font-semibold text-rose-600 dark:text-rose-300" : "text-ink-3"}`}>
              {query.length}/{maxLength}
            </span>
            <button
              type="submit"
              disabled={!isSendable}
              aria-label="보내기"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isSendable ? "bg-accent text-accent-fg hover:opacity-90" : "cursor-not-allowed bg-canvas text-ink-3"
              }`}
            >
              {isLoading ? <RiLoader4Line className="h-5 w-5 animate-spin" /> : <RiArrowUpLine className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

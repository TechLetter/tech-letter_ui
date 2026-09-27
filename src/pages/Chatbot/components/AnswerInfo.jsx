import { useEffect, useRef, useState } from "react";
import { RiInformationLine } from "react-icons/ri";
import { useEscapeKey } from "../../../hooks/useEscapeKey";

const count = (value) => (typeof value === "number" ? value.toLocaleString("ko-KR") : null);
const seconds = (ms) => (typeof ms === "number" ? `${(ms / 1000).toFixed(1)}s` : null);

/**
 * 답변 끝의 (i). 누르면 이 답변의 모델·토큰·응답 시간을 작게 보여 준다.
 * 토큰은 이 질문 하나에 든 LLM 호출(질의 재작성·계획·답변)의 합이다. 예전 답변은 모델만 있다.
 */
export default function AnswerInfo({ modelLabel, modelId, usage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEscapeKey(open, () => setOpen(false));
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const rows = [
    ["모델", modelLabel],
    ["입력 토큰", count(usage?.input_tokens)],
    ["출력 토큰", count(usage?.output_tokens)],
    ["LLM 호출", count(usage?.llm_calls)],
    ["응답 시간", seconds(usage?.latency_ms)],
  ].filter(([, value]) => value);
  if (rows.length === 0) return null;

  return (
    <div ref={ref} className="relative mt-1.5 inline-block">
      <button
        type="button"
        aria-label="답변 정보"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink-2"
      >
        <RiInformationLine className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="답변 정보"
          className="absolute bottom-full left-0 z-30 mb-1 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-lg dark:shadow-slate-950/60"
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex min-h-8 items-center justify-between gap-3 px-2.5 text-xs">
              <span className="shrink-0 text-ink-3">{label}</span>
              <span
                className={`min-w-0 truncate text-right font-semibold text-ink ${label === "모델" ? "" : "font-mono"}`}
                title={label === "모델" ? modelId : undefined}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

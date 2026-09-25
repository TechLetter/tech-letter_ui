import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RiCloseLine, RiRefreshLine, RiSearchLine } from "react-icons/ri";
import { exactTime, relativeTime } from "../adminFormat";

/** 어드민 탭들이 같이 쓰는 툴바 부품. 모델 페이지 툴바와 같은 모양이다. */

const DOT_TONE = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-300 dark:bg-slate-600",
};

/**
 * 마우스를 올리거나 포커스하면 바로 뜨는 툴팁. 표는 가로 스크롤 영역이라 안에 absolute로
 * 그리면 잘린다 — body에 fixed로 그린다. `content`는 여러 줄이면 배열로.
 */
export function Tip({ content, children }) {
  const ref = useRef(null);
  const [at, setAt] = useState(null);
  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setAt({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
  };
  const lines = Array.isArray(content) ? content.filter(Boolean) : [content];
  return (
    <span
      ref={ref}
      tabIndex={0}
      aria-label={lines.join(" · ")}
      onMouseEnter={show}
      onMouseLeave={() => setAt(null)}
      onFocus={show}
      onBlur={() => setAt(null)}
      className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      {children}
      {at &&
        createPortal(
          <div
            role="tooltip"
            style={{ left: at.x, top: at.y }}
            className="pointer-events-none fixed z-[60] -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg tabular-nums dark:bg-slate-700"
          >
            {lines.map((line, i) => (
              <div key={i} className={i === 0 ? "font-medium" : "text-slate-300"}>
                {line}
              </div>
            ))}
          </div>,
          document.body
        )}
    </span>
  );
}

export function Dot({ tone, label }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT_TONE[tone]}`}
    />
  );
}

/** `tabs`: [{ id, label, count, tone? }] — tone이 있으면 점을 붙인다. */
export function StateTabs({ tabs, value, onChange, label = "상태" }) {
  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-4 overflow-x-auto">
      {tabs.map((tab) => {
        const on = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-1 text-sm whitespace-nowrap ${
              on
                ? "border-indigo-500 font-semibold text-slate-900 dark:border-indigo-400 dark:text-slate-100"
                : "border-transparent font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.tone && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT_TONE[tab.tone]}`} />}
            {tab.label}
            {tab.count != null && (
              <span className="font-medium tabular-nums text-slate-400 dark:text-slate-500">
                {tab.count.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 입력이 멈추고 300ms 뒤에 `onChange`를 부른다. */
export function SearchBox({ value, onChange, placeholder, id, className = "w-44" }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return undefined;
    const timer = setTimeout(() => onChange(draft), 300);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <RiSearchLine aria-hidden="true" className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400" />
      <input
        id={id}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className={`${CONTROL} w-full pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden`}
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          aria-label="검색어 지우기"
          className="absolute right-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <RiCloseLine className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export const CONTROL =
  "h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function RefreshButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="새로고침"
      title="새로고침"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      <RiRefreshLine className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}

export function PrimaryButton({ onClick, children, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
    >
      {icon}
      {children}
    </button>
  );
}

export function IconAction({ onClick, disabled, label, tone = "indigo", children }) {
  const hover = {
    indigo: "hover:text-indigo-600 dark:hover:text-indigo-400",
    amber: "hover:text-amber-600 dark:hover:text-amber-400",
    blue: "hover:text-blue-600 dark:hover:text-blue-400",
    rose: "hover:text-rose-600 dark:hover:text-rose-400",
  }[tone];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 ${hover}`}
    >
      {children}
    </button>
  );
}

/** 상태 탭(왼쪽)과 검색·버튼(오른쪽)을 한 줄에. 넘치면 오른쪽이 아래로 내려간다. */
export function Toolbar({ left, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-slate-200 dark:border-slate-800">
      <div className="min-w-0 max-w-full">{left}</div>
      <div className="flex flex-wrap items-center gap-2 pb-2">{right}</div>
    </div>
  );
}

/** 상대 시간. 정확한 시각은 툴팁으로. */
export function RelTime({ iso, title }) {
  if (!iso) return <span title={title} className="text-slate-300 dark:text-slate-600">-</span>;
  return (
    <span title={title || exactTime(iso)} className="text-xs whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">
      {relativeTime(iso)}
    </span>
  );
}

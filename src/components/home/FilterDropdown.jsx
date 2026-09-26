import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

/** 데스크톱 출처·태그 버튼 + 드롭다운. 바깥 클릭·Esc 로 닫힌다. */
export default function FilterDropdown({ label, activeCount = 0, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const on = activeCount > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold ${
          on
            ? "border-accent bg-accent-soft text-accent-ink"
            : "border-line bg-surface text-ink-2 hover:bg-canvas"
        }`}
      >
        {label}
        {on && <span className="font-mono text-xs">{activeCount}</span>}
        <RiArrowDownSLine className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 flex max-h-[min(28rem,calc(100vh-10rem))] w-80 flex-col rounded-xl border border-line bg-surface py-2 shadow-lg dark:shadow-slate-950/60">
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

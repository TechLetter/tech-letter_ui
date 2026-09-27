import { useEffect, useRef, useState } from "react";
import { RiCoinLine } from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";
import { useEscapeKey } from "../../hooks/useEscapeKey";

/**
 * 헤더 크레딧 배지 — 로그인했을 때만. 2 이하면 주황. 누르면 남은 크레딧 팝오버.
 * 값은 AuthProvider 의 `user.credits` 그대로라 챗봇이 갱신하면 같이 바뀐다.
 */
export default function HeaderCredits({ className = "" }) {
  const { user, isAuthenticated } = useAuth();
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

  const remaining = user?.credits?.remaining;
  if (!isAuthenticated || typeof remaining !== "number") return null;
  const low = remaining <= 2;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`크레딧 (${remaining})`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-9 items-center gap-1 rounded-lg px-2 text-[13px] font-semibold ${
          low
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
            : "text-ink-2 hover:bg-canvas"
        }`}
      >
        <RiCoinLine className={`h-[18px] w-[18px] ${low ? "" : "text-ink-3"}`} />
        <span className="font-mono">{remaining}</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="크레딧"
          className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-line bg-surface p-1.5 shadow-lg dark:shadow-slate-950/60"
        >
          <div className="flex h-9 items-center justify-between px-2.5 text-[13px]">
            <span className="text-ink-2">남은 크레딧</span>
            <span className={`font-mono font-semibold ${low ? "text-amber-700 dark:text-amber-300" : "text-ink"}`}>({remaining})</span>
          </div>
        </div>
      )}
    </div>
  );
}

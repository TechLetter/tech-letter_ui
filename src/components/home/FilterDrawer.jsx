import { useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import HomeSidebar from "./HomeSidebar";

/** 모바일 좌측 드로어. 고르면 바로 반영되고, 닫기만 하면 된다. */
export default function FilterDrawer({ open, onClose, onClear, ...sidebarProps }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <section
        role="dialog"
        aria-label="주제 · 출처"
        className="absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-3rem))] animate-slideInLeft flex-col bg-surface"
      >
        <div className="flex h-14 shrink-0 items-center border-b border-line pr-2 pl-5">
          <h2 className="flex-1 text-[17px] font-bold text-ink">필터</h2>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="h-11 rounded-lg px-3 text-[13px] font-semibold text-ink-3 hover:text-ink"
            >
              초기화
            </button>
          )}
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-ink-2"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <HomeSidebar {...sidebarProps} dense={false} />
        </div>
      </section>
    </div>
  );
}

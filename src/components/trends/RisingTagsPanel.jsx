import { useState } from "react";
import { RiAddLine, RiArrowUpLine, RiCheckLine } from "react-icons/ri";

const COMPACT_VISIBLE_TAG_COUNT = 5;

export default function RisingTagsPanel({
  items = [],
  loading = false,
  selectedTags = [],
  maxSelectedTags = 5,
  onToggleTag,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCompactItemCount = items.filter(
    (item, index) =>
      index >= COMPACT_VISIBLE_TAG_COUNT && !selectedTags.includes(item.tag)
  ).length;

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            급상승 태그
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            직전 동일 기간 대비 증가량
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          표시할 태그가 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const isSelected = selectedTags.includes(item.tag);
            const isHiddenInCompactMode =
              !isExpanded &&
              !isSelected &&
              index >= COMPACT_VISIBLE_TAG_COUNT;
            const isSelectionLimitReached =
              !isSelected && selectedTags.length >= maxSelectedTags;
            return (
              <button
                type="button"
                key={item.tag}
                onClick={() => onToggleTag(item.tag)}
                disabled={isSelectionLimitReached}
                aria-pressed={isSelected}
                className={`${isHiddenInCompactMode ? "hidden xl:flex" : "flex"} w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : isSelectionLimitReached
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {item.tag}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <RiArrowUpLine className="h-3.5 w-3.5 text-emerald-500" />
                    {item.delta >= 0 ? `+${item.delta}` : item.delta}
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    {item.current_count}건
                  </span>
                </span>
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-indigo-200 bg-white text-indigo-600 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300"
                      : "border-slate-200 text-slate-400 dark:border-slate-700"
                  }`}
                >
                  {isSelected ? (
                    <RiCheckLine className="h-4 w-4" />
                  ) : (
                    <RiAddLine className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}

          {hiddenCompactItemCount > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 xl:hidden"
            >
              {isExpanded ? "접기" : `더보기 ${hiddenCompactItemCount}개`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

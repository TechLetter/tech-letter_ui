import { useMemo, useState } from "react";
import {
  RiCloseLine,
  RiPriceTag3Line,
  RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";

const PERIOD_OPTIONS = [
  { value: "30d", label: "30일" },
  { value: "90d", label: "90일" },
  { value: "180d", label: "180일" },
  { value: "365d", label: "1년" },
];

const INTERVAL_OPTIONS = [
  { value: "day", label: "일" },
  { value: "week", label: "주" },
  { value: "month", label: "월" },
];

export default function TrendControls({
  period,
  interval,
  selectedTags,
  tagOptions,
  isOverviewMode,
  onChangePeriod,
  onChangeInterval,
  onAddTag,
  onRemoveTag,
  onClearTags,
}) {
  const [searchText, setSearchText] = useState("");
  const filteredTags = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();
    return tagOptions
      .filter((tag) => {
        if (!normalizedSearchText) return true;
        return tag.name.toLowerCase().includes(normalizedSearchText);
      })
      .slice(0, 16);
  }, [searchText, tagOptions]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="기간"
            value={period}
            options={PERIOD_OPTIONS}
            onChange={onChangePeriod}
          />
          <SegmentedControl
            label="단위"
            value={interval}
            options={INTERVAL_OPTIONS}
            onChange={onChangeInterval}
          />
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300">
          <RiPriceTag3Line className="h-4 w-4" />
          {isOverviewMode ? "자동 기준: 급상승 태그" : "선택 태그 비교"}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              비교 태그
            </p>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={onClearTags}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <RiRefreshLine className="h-3.5 w-3.5" />
                초기화
              </button>
            )}
          </div>
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => onRemoveTag(tag)}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300"
                  title={`${tag} 제거`}
                >
                  <span className="max-w-[12rem] truncate">{tag}</span>
                  <RiCloseLine className="h-4 w-4" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              급상승 태그 기준
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className="relative block">
            <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="태그 검색"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2">
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              const isDisabled = isSelected || selectedTags.length >= 5;
              return (
                <button
                  type="button"
                  key={tag.name}
                  onClick={() => onAddTag(tag.name)}
                  disabled={isDisabled}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : isDisabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
                  }`}
                >
                  <span className="min-w-0 truncate">{tag.name}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {tag.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
      <span className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            value === option.value
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

import { RiArrowDownSLine, RiCloseLine, RiRefreshLine, RiSearchLine } from "react-icons/ri";
import { HEALTH_DOT_CLASS } from "../../../utils/modelHealth";
import { SORTS, STATE_TABS } from "../modelList";

const CONTROL =
  "h-11 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 lg:h-9 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

/** 상태 탭의 점은 카드의 상태 점과 같은 색이라 범례도 겸한다. */
function StateTabs({ counts, value, onChange }) {
  return (
    <div role="tablist" aria-label="상태" className="-mb-px flex gap-3 overflow-x-auto lg:gap-4">
      {STATE_TABS.map(([key, label]) => {
        const on = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(key)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-1 text-sm whitespace-nowrap lg:h-10 ${
              on
                ? "border-indigo-500 font-semibold text-slate-900 dark:border-indigo-400 dark:text-slate-100"
                : "border-transparent font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {key !== "all" && (
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${HEALTH_DOT_CLASS[key]}`} />
            )}
            {label}
            <span className="font-medium tabular-nums text-slate-400 dark:text-slate-500">
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ModelToolbar({
  counts,
  state,
  onState,
  query,
  onQuery,
  sort,
  onSort,
  checkedLabel,
  loading,
  onRefresh,
}) {
  const refreshLabel = checkedLabel ? `새로고침 · ${checkedLabel} 확인` : "새로고침";
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:border-b lg:border-slate-200 lg:dark:border-slate-800">
      <div className="border-b border-slate-200 lg:border-0 dark:border-slate-800">
        <StateTabs counts={counts} value={state} onChange={onState} />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3 lg:pb-1.5">
        <div className="relative flex items-center lg:w-56">
          <label htmlFor="model-search" className="sr-only">
            모델 검색
          </label>
          <RiSearchLine
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400"
          />
          <input
            id="model-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="모델 검색"
            className={`${CONTROL} w-full pr-10 pl-8 [&::-webkit-search-cancel-button]:hidden`}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="검색어 지우기"
              className="absolute right-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 lg:h-8 lg:w-8 dark:hover:text-slate-200"
            >
              <RiCloseLine className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="model-sort" className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
            정렬
          </label>
          <span className="relative flex flex-1 items-center lg:flex-none">
            <select
              id="model-sort"
              value={sort}
              onChange={(e) => onSort(e.target.value)}
              className={`${CONTROL} w-full cursor-pointer appearance-none pr-8 pl-3 lg:text-[13px]`}
            >
              {Object.entries(SORTS)
                .filter(([, item]) => !item.metric)
                .map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              <optgroup label="Artificial Analysis">
                {Object.entries(SORTS)
                  .filter(([, item]) => item.metric)
                  .map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
              </optgroup>
            </select>
            <RiArrowDownSLine
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 h-4 w-4 text-slate-400"
            />
          </span>
          {checkedLabel && (
            <span className="hidden text-xs whitespace-nowrap tabular-nums text-slate-500 lg:inline dark:text-slate-400">
              {checkedLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label={refreshLabel}
            title={refreshLabel}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 lg:h-9 lg:w-9 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <RiRefreshLine className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { RiPriceTag3Line } from "react-icons/ri";

const PERIOD_OPTIONS = [
  { value: "30d", label: "30일" },
  { value: "180d", label: "180일" },
  { value: "365d", label: "1년" },
  { value: "3y", label: "3년" },
];

const INTERVAL_OPTIONS = [
  { value: "day", label: "일" },
  { value: "week", label: "주" },
  { value: "month", label: "월" },
];

export default function TrendControls({
  period,
  interval,
  isOverviewMode,
  onChangePeriod,
  onChangeInterval,
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
    </section>
  );
}

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950 sm:w-auto sm:rounded-full">
      <span className="shrink-0 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div
        className="grid min-w-0 flex-1 gap-1 sm:flex sm:flex-none"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`min-w-0 truncate rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors sm:rounded-full sm:px-2.5 sm:py-1 ${
              value === option.value
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

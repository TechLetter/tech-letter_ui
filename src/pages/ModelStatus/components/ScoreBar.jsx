/** Artificial Analysis 지수(0–100) 한 줄. 벤치마크로 정렬할 때 카드에 붙는다. */
export default function ScoreBar({ label, value, barClass = "w-16 flex-none" }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs tabular-nums"
      title={`Artificial Analysis ${label} ${value ?? "-"}`}
    >
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        aria-hidden="true"
        className={`h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${barClass}`}
      >
        <span
          className="block h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
          style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
        />
      </span>
      <span className="w-8 text-right font-semibold text-slate-800 dark:text-slate-100">
        {value ?? <span className="font-normal text-slate-300 dark:text-slate-600">—</span>}
      </span>
    </span>
  );
}

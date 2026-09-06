import { useMemo } from "react";
import { RiCloseLine } from "react-icons/ri";

const PERIOD_OPTIONS = [
  { value: "1d", label: "1일" },
  { value: "1w", label: "1주" },
  { value: "1m", label: "1개월" },
  { value: "1y", label: "1년" },
];

export default function ModelHistoryChart({
  modelId,
  points,
  period,
  loading,
  onChangePeriod,
  onClose,
}) {
  const chart = useMemo(() => buildChart(points), [points]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">일별 uptime 추이</p>
          <code className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {modelId}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            {PERIOD_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onChangePeriod(option.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  period === option.value
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="닫기"
          >
            <RiCloseLine className="text-lg" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      ) : chart.points.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          이 기간엔 기록이 없습니다.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-44 w-full"
          role="img"
          aria-label={`${modelId} uptime 추이`}
        >
          {[100, 50, 0].map((tick) => {
            const y = chart.getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={chart.padding.left}
                  x2={chart.width - chart.padding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                />
                <text
                  x={chart.padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {chart.points.map((point, index) => {
            const shouldShow =
              index === 0 ||
              index === chart.points.length - 1 ||
              index % Math.ceil(chart.points.length / 5) === 0;
            if (!shouldShow) return null;
            return (
              <text
                key={point.date}
                x={chart.getX(index)}
                y={chart.height - 10}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {formatDateLabel(point.date)}
              </text>
            );
          })}

          <path
            d={chart.path}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {chart.points.map((point, index) => (
            <circle
              key={point.date}
              cx={chart.getX(index)}
              cy={chart.getY(point.uptime)}
              r="3.5"
              fill="#4f46e5"
            />
          ))}
        </svg>
      )}
    </section>
  );
}

function buildChart(points = []) {
  const width = 720;
  const height = 180;
  const padding = { top: 10, right: 16, bottom: 24, left: 32 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (index) => {
    if (points.length <= 1) return padding.left + plotWidth / 2;
    return padding.left + (plotWidth * index) / (points.length - 1);
  };
  const getY = (value) => padding.top + plotHeight - (plotHeight * value) / 100;

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${getX(index)},${getY(point.uptime)}`)
    .join(" ");

  return { width, height, padding, points, path, getX, getY };
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

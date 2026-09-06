import { useMemo, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { useChartHover } from "../../../hooks/useChartHover";

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

  // 기간 전환마다 스켈레톤으로 지우면 깜빡여 보인다 — 이전 차트를 흐리게 유지한다.
  const [lastChart, setLastChart] = useState(null);
  if (!loading && chart.points.length > 0 && lastChart !== chart) {
    setLastChart(chart);
  }
  const displayChart = loading && lastChart ? lastChart : chart;
  const isStale = loading && lastChart != null;

  const { svgRef, hoverIndex, onPointerMove, onPointerLeave } = useChartHover({
    width: displayChart.width,
    padding: displayChart.padding,
    plotWidth: displayChart.plotWidth,
    pointCount: displayChart.points.length,
  });
  const hovered = hoverIndex != null ? displayChart.points[hoverIndex] : null;

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

      {loading && !lastChart ? (
        <div className="h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      ) : displayChart.points.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          이 기간엔 기록이 없습니다.
        </div>
      ) : (
        <div className={`relative transition-opacity ${isStale ? "opacity-50" : ""}`}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${displayChart.width} ${displayChart.height}`}
            className="h-44 w-full touch-none"
            role="img"
            aria-label={`${modelId} uptime 추이`}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
          >
            {[100, 50, 0].map((tick) => {
              const y = displayChart.getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={displayChart.padding.left}
                    x2={displayChart.width - displayChart.padding.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <text
                    x={displayChart.padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {displayChart.points.map((point, index) => {
              const shouldShow =
                index === 0 ||
                index === displayChart.points.length - 1 ||
                index % Math.ceil(displayChart.points.length / 5) === 0;
              if (!shouldShow) return null;
              return (
                <text
                  key={point.date}
                  x={displayChart.getX(index)}
                  y={displayChart.height - 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px]"
                >
                  {formatDateLabel(point.date)}
                </text>
              );
            })}

            {hovered && (
              <line
                x1={displayChart.getX(hoverIndex)}
                x2={displayChart.getX(hoverIndex)}
                y1={displayChart.padding.top}
                y2={displayChart.height - displayChart.padding.bottom}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-300 dark:text-slate-600"
              />
            )}

            <path
              d={displayChart.path}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {displayChart.points.map((point, index) => (
              <circle
                key={point.date}
                cx={displayChart.getX(index)}
                cy={displayChart.getY(point.uptime)}
                r={index === hoverIndex ? "5" : "4"}
                fill="#4f46e5"
                stroke="white"
                strokeWidth="2"
                className="dark:stroke-slate-900"
              />
            ))}
          </svg>

          {hovered && (
            <div
              className={`pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800 ${
                // 위쪽 값이면 위로 띄울 자리가 없어 기간 탭과 겹친다.
                displayChart.getY(hovered.uptime) < 40
                  ? "translate-y-[14px]"
                  : "-translate-y-[calc(100%+10px)]"
              }`}
              style={{
                left: `${(displayChart.getX(hoverIndex) / displayChart.width) * 100}%`,
                top: `${(displayChart.getY(hovered.uptime) / displayChart.height) * 100}%`,
              }}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {hovered.uptime.toFixed(1)}% uptime
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {formatDateLabel(hovered.date)} · {hovered.successes}/{hovered.checks}회
                {hovered.rate_limited > 0 ? ` · 429 ${hovered.rate_limited}회` : ""}
              </div>
            </div>
          )}
        </div>
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

  return { width, height, padding, plotWidth, plotHeight, points, path, getX, getY };
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}


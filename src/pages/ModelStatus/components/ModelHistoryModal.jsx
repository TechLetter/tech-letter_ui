import { useEffect, useMemo, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { useChartHover } from "../../../hooks/useChartHover";

const PERIOD_OPTIONS = [
  { value: "1d", label: "1일" },
  { value: "1w", label: "1주" },
  { value: "1m", label: "1개월" },
  { value: "1y", label: "1년" },
];

const METRIC_OPTIONS = [
  { value: "uptime", label: "Uptime" },
  { value: "latency", label: "지연" },
];

/**
 * 모델 세부 차트. 목록 사이에 끼워 넣으면 클릭할 때마다 페이지 레이아웃이
 * 출렁여서, 대신 모달로 띄운다 — 목록은 그대로 있고 차트만 위에 겹친다.
 */
export default function ModelHistoryModal({
  modelId,
  points,
  period,
  metric,
  loading,
  onChangePeriod,
  onChangeMetric,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const chart = useMemo(() => buildChart(points, metric), [points, metric]);

  // 기간·지표 전환마다 스켈레톤으로 지우면 깜빡여 보인다 — 이전 차트를 흐리게 유지한다.
  const [lastChart, setLastChart] = useState(null);
  if (!loading && chart.usable.length > 0 && lastChart !== chart) {
    setLastChart(chart);
  }
  const displayChart = loading && lastChart ? lastChart : chart;
  const isStale = loading && lastChart != null;

  const { svgRef, hoverIndex, onPointerMove, onPointerLeave } = useChartHover({
    width: displayChart.width,
    padding: displayChart.padding,
    plotWidth: displayChart.plotWidth,
    pointCount: displayChart.usable.length,
  });
  const hovered = hoverIndex != null ? displayChart.usable[hoverIndex] : null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${modelId} 세부 차트`}
    >
      <section className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              일별 {metric === "latency" ? "평균 지연" : "uptime"} 추이
            </p>
            <code className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {modelId}
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
              {METRIC_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => onChangeMetric(option.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    metric === option.value
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
        ) : displayChart.usable.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {points.length === 0
              ? "이 기간엔 기록이 없습니다."
              : "이 기간엔 지연 기록이 없습니다."}
          </div>
        ) : (
          <div className={`relative transition-opacity ${isStale ? "opacity-50" : ""}`}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${displayChart.width} ${displayChart.height}`}
              className="h-44 w-full touch-none"
              role="img"
              aria-label={`${modelId} ${metric === "latency" ? "지연" : "uptime"} 추이`}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            >
              {displayChart.ticks.map((tick) => {
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
                      {displayChart.formatTick(tick)}
                    </text>
                  </g>
                );
              })}

              {displayChart.usable.map((point, index) => {
                const shouldShow =
                  index === 0 ||
                  index === displayChart.usable.length - 1 ||
                  index % Math.ceil(displayChart.usable.length / 5) === 0;
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
              {displayChart.usable.map((point, index) => (
                <circle
                  key={point.date}
                  cx={displayChart.getX(index)}
                  cy={displayChart.getY(displayChart.valueOf(point))}
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
                  displayChart.getY(displayChart.valueOf(hovered)) < 40
                    ? "translate-y-[14px]"
                    : "-translate-y-[calc(100%+10px)]"
                }`}
                style={{
                  left: `${(displayChart.getX(hoverIndex) / displayChart.width) * 100}%`,
                  top: `${(displayChart.getY(displayChart.valueOf(hovered)) / displayChart.height) * 100}%`,
                }}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {hovered.uptime.toFixed(1)}% uptime
                  {typeof hovered.avg_latency_ms === "number" &&
                    ` · ${(hovered.avg_latency_ms / 1000).toFixed(1)}s`}
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
    </div>
  );
}

function buildChart(points = [], metric = "uptime") {
  const width = 720;
  const height = 180;
  const padding = { top: 10, right: 16, bottom: 24, left: 36 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // 지연은 기록이 아예 없는 날(체크 자체가 실패해 평균을 못 낸 날)이 있을 수
  // 있다 — 그런 점은 선을 잇지 않고 건너뛴다.
  const usable =
    metric === "latency" ? points.filter((p) => typeof p.avg_latency_ms === "number") : points;

  const valueOf = (p) => (metric === "latency" ? p.avg_latency_ms / 1000 : p.uptime);
  const maxValue =
    metric === "latency" ? Math.max(1, ...usable.map(valueOf)) : 100;
  const ticks = metric === "latency" ? [maxValue, maxValue / 2, 0] : [100, 50, 0];
  const formatTick = (value) =>
    metric === "latency" ? `${value.toFixed(1)}s` : `${value}`;

  const getX = (index) => {
    if (usable.length <= 1) return padding.left + plotWidth / 2;
    return padding.left + (plotWidth * index) / (usable.length - 1);
  };
  const getY = (value) => padding.top + plotHeight - (plotHeight * value) / maxValue;

  const path = usable
    .map((point, index) => `${index === 0 ? "M" : "L"}${getX(index)},${getY(valueOf(point))}`)
    .join(" ");

  return {
    width,
    height,
    padding,
    plotWidth,
    plotHeight,
    usable,
    path,
    getX,
    getY,
    ticks,
    formatTick,
    valueOf,
  };
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

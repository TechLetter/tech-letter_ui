import { useMemo, useState } from "react";
import { useChartHover } from "../../hooks/useChartHover";

const CHART_COLORS = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#0891b2"];
const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 18, right: 24, bottom: 34, left: 48 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

export default function TrendLineChart({ series = [], loading = false }) {
  const chartData = useMemo(() => buildChartData(series), [series]);

  // 기간·태그 전환마다 스켈레톤으로 지우면 깜빡여 보인다 — 이전 차트를 흐리게 유지한다.
  const [lastData, setLastData] = useState(null);
  if (!loading && chartData.buckets.length > 0 && lastData !== chartData) {
    setLastData(chartData);
  }
  const displayData = loading && lastData ? lastData : chartData;
  const isStale = loading && lastData != null;

  const { svgRef, hoverIndex, onPointerMove, onPointerLeave } = useChartHover({
    width: WIDTH,
    padding: PADDING,
    plotWidth: PLOT_WIDTH,
    pointCount: displayData.buckets.length,
  });

  if (loading && !lastData) {
    return (
      <div className="h-[17rem] self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      </div>
    );
  }

  if (displayData.buckets.length === 0) {
    return (
      <div className="flex h-[17rem] self-start items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        표시할 트렌드 데이터가 없습니다.
      </div>
    );
  }

  const maxValue = Math.max(1, displayData.maxValue);
  const yTicks = Array.from(new Set([maxValue, Math.floor(maxValue / 2), 0]));

  const getX = (index) => {
    if (displayData.buckets.length === 1) {
      return PADDING.left + PLOT_WIDTH / 2;
    }
    return PADDING.left + (PLOT_WIDTH * index) / (displayData.buckets.length - 1);
  };
  const getY = (value) => PADDING.top + PLOT_HEIGHT - (PLOT_HEIGHT * value) / maxValue;
  const hoveredBucket = hoverIndex != null ? displayData.buckets[hoverIndex] : null;

  return (
    <section className="self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            태그 언급 추이
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {displayData.lines.map((line, index) => (
            <div
              key={line.tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="max-w-[8rem] truncate">{line.tag}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`relative overflow-hidden transition-opacity ${isStale ? "opacity-50" : ""}`}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-52 w-full touch-none sm:h-56"
          role="img"
          aria-label="태그별 포스트 수 시계열 차트"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-100 dark:text-slate-800"
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {displayData.buckets.map((bucket, index) => {
            const shouldShow =
              index === 0 ||
              index === displayData.buckets.length - 1 ||
              index % Math.ceil(displayData.buckets.length / 4) === 0;
            if (!shouldShow) return null;
            const x = getX(index);
            return (
              <text
                key={bucket}
                x={x}
                y={HEIGHT - 16}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {formatBucketLabel(bucket)}
              </text>
            );
          })}

          {hoveredBucket && (
            <line
              x1={getX(hoverIndex)}
              x2={getX(hoverIndex)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-300 dark:text-slate-600"
            />
          )}

          {displayData.lines.map((line, lineIndex) => {
            const color = CHART_COLORS[lineIndex % CHART_COLORS.length];
            const path = line.values
              .map((value, index) => {
                const command = index === 0 ? "M" : "L";
                return `${command}${getX(index)},${getY(value)}`;
              })
              .join(" ");
            return (
              <g key={line.tag}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {line.values.map((value, index) => (
                  <circle
                    key={`${line.tag}-${displayData.buckets[index]}`}
                    cx={getX(index)}
                    cy={getY(value)}
                    r={index === hoverIndex ? "5" : "4"}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="dark:stroke-slate-900"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {hoveredBucket && (
          <div
            className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800 ${
              hoverIndex < displayData.buckets.length / 2 ? "translate-x-3" : "-translate-x-[calc(100%+0.75rem)]"
            }`}
            style={{ left: `${(getX(hoverIndex) / WIDTH) * 100}%`, top: PADDING.top }}
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {formatBucketLabel(hoveredBucket)}
            </div>
            {displayData.lines.map((line, index) => (
              <div key={line.tag} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="truncate">{line.tag}</span>
                <span className="ml-auto font-medium text-slate-700 dark:text-slate-300">
                  {line.values[hoverIndex]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function buildChartData(series) {
  const bucketSet = new Set();
  series.forEach((item) => {
    item.points?.forEach((point) => {
      bucketSet.add(point.bucket);
    });
  });

  const buckets = Array.from(bucketSet).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  let maxValue = 0;
  const lines = series.map((item) => {
    const valueByBucket = new Map(
      (item.points || []).map((point) => [point.bucket, point.post_count])
    );
    const values = buckets.map((bucket) => Number(valueByBucket.get(bucket) || 0));
    maxValue = Math.max(maxValue, ...values);
    return {
      tag: item.tag,
      values,
    };
  });

  return {
    buckets,
    lines: lines.filter((line) => line.values.some((value) => value > 0)),
    maxValue,
  };
}

function formatBucketLabel(bucket) {
  const date = new Date(bucket);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

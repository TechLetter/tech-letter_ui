import { useMemo } from "react";

const CHART_COLORS = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#0891b2"];

export default function TrendLineChart({ series = [], loading = false }) {
  const chartData = useMemo(() => buildChartData(series), [series]);

  if (loading) {
    return (
      <div className="h-[22rem] rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      </div>
    );
  }

  if (chartData.buckets.length === 0) {
    return (
      <div className="flex h-[22rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        표시할 트렌드 데이터가 없습니다.
      </div>
    );
  }

  const width = 720;
  const height = 280;
  const padding = { top: 28, right: 24, bottom: 44, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, chartData.maxValue);
  const yTicks = Array.from(new Set([maxValue, Math.floor(maxValue / 2), 0]));

  const getX = (index) => {
    if (chartData.buckets.length === 1) {
      return padding.left + plotWidth / 2;
    }
    return padding.left + (plotWidth * index) / (chartData.buckets.length - 1);
  };
  const getY = (value) => padding.top + plotHeight - (plotHeight * value) / maxValue;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            태그 언급 추이
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            태그가 달린 포스트 수 기준
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chartData.lines.map((line, index) => (
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

      <div className="overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="태그별 포스트 수 시계열 차트"
        >
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {chartData.buckets.map((bucket, index) => {
            const shouldShow =
              index === 0 ||
              index === chartData.buckets.length - 1 ||
              index % Math.ceil(chartData.buckets.length / 4) === 0;
            if (!shouldShow) return null;
            const x = getX(index);
            return (
              <text
                key={bucket}
                x={x}
                y={height - 16}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {formatBucketLabel(bucket)}
              </text>
            );
          })}

          {chartData.lines.map((line, lineIndex) => {
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
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {line.values.map((value, index) => (
                  <circle
                    key={`${line.tag}-${chartData.buckets[index]}`}
                    cx={getX(index)}
                    cy={getY(value)}
                    r="3.5"
                    fill={color}
                  />
                ))}
              </g>
            );
          })}
        </svg>
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

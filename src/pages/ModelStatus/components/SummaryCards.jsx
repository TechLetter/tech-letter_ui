import { formatKSTDateTime } from "../../../utils/timeutils";

function StatCard({ label, value, tone = "neutral", loading }) {
  const tones = {
    neutral: "text-slate-900 dark:text-slate-100",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      {loading ? (
        <div className="mt-1.5 h-7 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
      ) : (
        <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
      )}
    </div>
  );
}

export default function SummaryCards({ summary, loading }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="전체 모델" value={summary?.total_models ?? "-"} loading={loading} />
        <StatCard
          label="정상"
          value={summary?.healthy_count ?? "-"}
          tone="success"
          loading={loading}
        />
        <StatCard
          label="저하"
          value={summary?.degraded_count ?? "-"}
          tone="warning"
          loading={loading}
        />
        <StatCard label="다운" value={summary?.down_count ?? "-"} tone="danger" loading={loading} />
      </div>
      {summary?.last_checked_at && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          마지막 헬스체크: {formatKSTDateTime(summary.last_checked_at)}
        </p>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  RiDeleteBin6Line,
  RiRefreshLine,
  RiRestartLine,
} from "react-icons/ri";
import Badge from "../../../components/common/Badge";
import Table from "../../../components/common/Table";
import { showToast } from "../../../provider/toastModalBridge";
import {
  deleteJob,
  getBackfillStatus,
  getJobStats,
  getJobs,
  handleAdminError,
  retryJob,
  retryJobsBulk,
  runEmbeddingBackfill,
  runSummaryBackfill,
} from "../../../api/adminApi";
import { formatKSTDateTime } from "../../../utils/timeutils";

/**
 * 운영 탭.
 *
 * 실패한 잡을 여기서 보고 되살린다.
 */

const STATUS_VARIANT = {
  pending: "info",
  running: "warning",
  done: "success",
  dead: "error",
};

const STATUS_FILTERS = [
  { value: "dead", label: "실패(dead)" },
  { value: "pending", label: "대기" },
  { value: "running", label: "실행 중" },
  { value: "done", label: "완료" },
  { value: "", label: "전체" },
];

const PAGE_SIZE = 20;

function StatCard({ label, value, tone = "neutral" }) {
  const tones = {
    neutral: "text-slate-900 dark:text-slate-100",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

export default function OpsTab() {
  const [stats, setStats] = useState(null);
  const [backfill, setBackfill] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("dead");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [jobStats, backfillStatus, jobPage] = await Promise.all([
        getJobStats(),
        getBackfillStatus(),
        getJobs({ page, page_size: PAGE_SIZE, status: status || undefined }),
      ]);
      setStats(jobStats);
      setBackfill(backfillStatus);
      setJobs(jobPage.items || []);
      setTotal(jobPage.total || 0);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const withBusy = async (key, action, successMessage) => {
    setBusy(key);
    try {
      const result = await action();
      showToast(successMessage(result), "success");
      await refresh();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    {
      key: "type",
      label: "타입",
      width: "220px",
      render: (type, row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{type}</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            key: {row.key}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "상태",
      width: "150px",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={STATUS_VARIANT[value] || "neutral"}>{value}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.attempt}/{row.max_attempt}회
            {row.error_kind ? ` · ${row.error_kind}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "last_error",
      label: "마지막 오류",
      render: (value) => (
        <div className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
          {value || "-"}
        </div>
      ),
    },
    {
      key: "updated_at",
      label: "갱신",
      width: "160px",
      render: (value) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatKSTDateTime(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      align: "right",
      sticky: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          {row.status === "dead" && (
            <button
              type="button"
              disabled={busy === row.id}
              onClick={() =>
                withBusy(row.id, () => retryJob(row.id), () => "잡을 다시 큐에 넣었습니다.")
              }
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
              title="재시도"
            >
              <RiRestartLine />
            </button>
          )}
          <button
            type="button"
            disabled={busy === row.id}
            onClick={() =>
              withBusy(row.id, () => deleteJob(row.id), () => "잡을 삭제했습니다.")
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
            title="삭제"
          >
            <RiDeleteBin6Line />
          </button>
        </div>
      ),
    },
  ];

  const byStatus = stats?.by_status || {};
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="대기" value={byStatus.pending ?? 0} />
        <StatCard label="실행 중" value={byStatus.running ?? 0} tone="warning" />
        <StatCard label="완료" value={byStatus.done ?? 0} />
        <StatCard
          label="실패(dead)"
          value={byStatus.dead ?? 0}
          tone={byStatus.dead ? "danger" : "neutral"}
        />
        <StatCard
          label="미요약 포스트"
          value={backfill?.unsummarized ?? 0}
          tone={backfill?.unsummarized ? "warning" : "neutral"}
        />
      </div>

      {stats?.oldest_pending_at && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          가장 오래된 대기 잡: {formatKSTDateTime(stats.oldest_pending_at)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"
        >
          <RiRefreshLine /> 새로고침
        </button>

        <button
          type="button"
          disabled={busy === "bulk" || !byStatus.dead}
          onClick={() =>
            withBusy(
              "bulk",
              () => retryJobsBulk({ limit: 100 }),
              (result) => `${result.retried}건을 다시 큐에 넣었습니다.`
            )
          }
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          실패 잡 일괄 재시도
        </button>

        <button
          type="button"
          disabled={busy === "summary" || !backfill?.unsummarized}
          onClick={() =>
            withBusy(
              "summary",
              () => runSummaryBackfill({ limit: 50 }),
              (result) => `요약 백필 ${result.enqueued}건을 걸었습니다.`
            )
          }
          className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 disabled:opacity-40 dark:border-indigo-900 dark:text-indigo-400"
        >
          요약 백필
        </button>

        <button
          type="button"
          disabled={busy === "embedding" || !backfill?.unembedded}
          onClick={() =>
            withBusy(
              "embedding",
              () => runEmbeddingBackfill({ limit: 50 }),
              (result) => `임베딩 백필 ${result.enqueued}건을 걸었습니다.`
            )
          }
          className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 disabled:opacity-40 dark:border-indigo-900 dark:text-indigo-400"
        >
          임베딩 백필 ({backfill?.unembedded ?? 0})
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Table
          columns={columns}
          data={jobs}
          loading={loading}
          emptyMessage="해당 상태의 잡이 없습니다."
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            이전
          </button>
          <span className="text-slate-500 dark:text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

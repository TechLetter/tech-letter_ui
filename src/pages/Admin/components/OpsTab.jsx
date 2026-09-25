import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RiDeleteBin6Line, RiRestartLine } from "react-icons/ri";
import Pagination, { DEFAULT_PAGE_SIZE } from "../../../components/common/Pagination";
import { PATHS } from "../../../routes/path";
import { showToast } from "../../../provider/toastModalBridge";
import {
  deleteJob,
  getBackfillStatus,
  getBlogs,
  getJobStats,
  getJobs,
  handleAdminError,
  retryJob,
  runEmbeddingBackfill,
  runSummaryBackfill,
} from "../../../api/adminApi";
import { exactTime, relativeTime, scheduleLabel } from "../adminFormat";
import { Dot, IconAction, RefreshButton, RelTime, StateTabs, Toolbar } from "./AdminKit";

/**
 * 운영 탭. 파이프라인(수집 → 요약 → 임베딩)이 멈췄는지, 멈췄다면 왜인지.
 */

const LISTS = [
  { id: "dead", label: "실패", tone: "rose" },
  { id: "pending", label: "대기", tone: "amber" },
  { id: "running", label: "실행 중", tone: "emerald" },
];
const TYPE_LABEL = {
  "content.fetch_requested": "본문 수집",
  "summary.requested": "요약",
  "summary.completed": "요약 저장",
  "embedding.requested": "임베딩",
  "embedding.completed": "임베딩 저장",
  "embedding.delete_requested": "벡터 삭제",
  "chat.compression_requested": "대화 압축",
};
const STAGE_TYPES = {
  summary: ["content.fetch_requested", "summary.requested", "summary.completed"],
  embedding: ["embedding.requested", "embedding.completed"],
};

const countOf = (byType, types, status) =>
  types.reduce((sum, type) => sum + (byType?.[`${type}:${status}`] || 0), 0);

function Stage({ title, value, lines, action }) {
  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{value}</div>
      <div className="mt-2 flex flex-1 flex-col gap-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
        {lines.filter(Boolean).map((line, index) => (
          <span key={index} className="flex min-w-0 items-center gap-1.5">
            {line}
          </span>
        ))}
      </div>
      {action && <div className="mt-3">{action}</div>}
    </section>
  );
}

function BackfillButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

function JobRow({ job, busy, onRetry, onDelete }) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={job.title || job.key}>
          {job.title || job.key}
        </div>
        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
          {[job.blog_name, TYPE_LABEL[job.type] || job.type, `${job.attempt}/${job.max_attempt}회`]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      {job.status === "pending" && job.run_at && new Date(job.run_at) > new Date() ? (
        <span title={exactTime(job.run_at)} className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {scheduleLabel(job.run_at)}
        </span>
      ) : (
        <RelTime iso={job.updated_at} />
      )}
      <div className="flex shrink-0">
        {job.status === "dead" && (
          <IconAction onClick={onRetry} disabled={busy} label="재시도">
            <RiRestartLine className="h-4 w-4" />
          </IconAction>
        )}
        <IconAction onClick={onDelete} disabled={busy} label="삭제" tone="rose">
          <RiDeleteBin6Line className="h-4 w-4" />
        </IconAction>
      </div>
    </li>
  );
}

export default function OpsTab() {
  const [stats, setStats] = useState(null);
  const [backfill, setBackfill] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [list, setList] = useState("dead");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // 실패는 오류별로 묶어 보여 주려고 한 번에 받는다(평소 몇 건 안 된다).
      const size = list === "dead" ? 100 : DEFAULT_PAGE_SIZE;
      const [jobStats, backfillStatus, blogPage, jobPage] = await Promise.all([
        getJobStats(),
        getBackfillStatus(),
        getBlogs({ page_size: 100 }),
        getJobs({ page: list === "dead" ? 1 : page, page_size: size, status: list }),
      ]);
      setStats(jobStats);
      setBackfill(backfillStatus);
      setBlogs(blogPage.items || []);
      setJobs(jobPage.items || []);
      setTotal(jobPage.total || 0);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, list]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const withBusy = async (key, action, message) => {
    setBusy(key);
    try {
      const result = await action();
      if (message) showToast(message(result), "success");
      await refresh();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setBusy(null);
    }
  };

  const byType = stats?.by_type;
  const byStatus = stats?.by_status || {};
  const active = blogs.filter((blog) => blog.is_active);
  const failing = active.filter((blog) => blog.consecutive_failures > 0);
  const lastFetchedAt = active.map((b) => b.last_fetched_at).filter(Boolean).sort().at(-1);
  const embeddingPending = countOf(byType, STAGE_TYPES.embedding, "pending");
  const resumeAt =
    stats?.oldest_pending_at && new Date(stats.oldest_pending_at) > new Date() ? stats.oldest_pending_at : null;

  const groups = useMemo(() => {
    if (list !== "dead") return [];
    const map = new Map();
    for (const job of jobs) {
      const key = job.last_error || "알 수 없는 오류";
      map.set(key, [...(map.get(key) || []), job]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [jobs, list]);

  const retryAll = (group) =>
    withBusy(
      `group:${group[0]}`,
      async () => {
        for (const job of group[1]) await retryJob(job.id);
        return group[1].length;
      },
      (n) => `${n}건을 다시 걸었습니다.`
    );

  const rowProps = (job) => ({
    job,
    busy: busy === job.id,
    onRetry: () => withBusy(job.id, () => retryJob(job.id)),
    onDelete: () => withBusy(job.id, () => deleteJob(job.id)),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Stage
          title="수집"
          value={<span title={exactTime(lastFetchedAt)}>{relativeTime(lastFetchedAt)}</span>}
          lines={[
            <>
              <Dot tone={failing.length ? "amber" : "emerald"} label={failing.length ? "실패 중인 블로그 있음" : "정상"} />
              블로그 {active.length}개 · 실패 {failing.length}
            </>,
            ...failing.slice(0, 2).map((blog) => (
              <span key={blog.id} className="truncate" title={blog.last_fetch_error || ""}>
                {blog.name} · {blog.consecutive_failures}회
              </span>
            )),
            failing.length > 0 && (
              <Link to={`${PATHS.ADMIN}/blogs?state=failing`} className="text-xs">
                <span className="text-indigo-600 hover:underline dark:text-indigo-400">블로그 보기</span>
              </Link>
            ),
          ]}
        />
        <Stage
          title="요약"
          value={`${(backfill?.unsummarized ?? 0).toLocaleString()}개 남음`}
          lines={[
            `대기 ${countOf(byType, STAGE_TYPES.summary, "pending")} · 실패 ${countOf(byType, STAGE_TYPES.summary, "dead")}`,
          ]}
          action={
            <BackfillButton
              disabled={busy === "summary" || !backfill?.unsummarized}
              onClick={() =>
                withBusy(
                  "summary",
                  () => runSummaryBackfill({ limit: 50 }),
                  (result) => `요약 ${result.enqueued}건을 걸었습니다.`
                )
              }
            >
              요약 백필
            </BackfillButton>
          }
        />
        <Stage
          title="임베딩"
          value={`${(backfill?.unembedded ?? 0).toLocaleString()}개 남음`}
          lines={[
            `대기 ${embeddingPending} · 실패 ${countOf(byType, STAGE_TYPES.embedding, "dead")}`,
            resumeAt && embeddingPending > 0 && (
              <span title={exactTime(resumeAt)}>
                <Dot tone="amber" label="예약됨" /> {scheduleLabel(resumeAt)} 재개
              </span>
            ),
          ]}
          action={
            <BackfillButton
              disabled={busy === "embedding" || !backfill?.unembedded}
              onClick={() =>
                withBusy(
                  "embedding",
                  () => runEmbeddingBackfill({ limit: 50 }),
                  (result) => `임베딩 ${result.enqueued}건을 걸었습니다.`
                )
              }
            >
              임베딩 백필
            </BackfillButton>
          }
        />
      </div>

      <Toolbar
        left={
          <StateTabs
            label="잡"
            tabs={LISTS.map((item) => ({ ...item, count: byStatus[item.id] ?? 0 }))}
            value={list}
            onChange={(id) => {
              setList(id);
              setPage(1);
            }}
          />
        }
        right={<RefreshButton onClick={refresh} loading={loading} />}
      />

      {jobs.length === 0 && !loading && (
        <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          없음
        </p>
      )}

      {list === "dead" ? (
        groups.map((group) => (
          <section
            key={group[0]}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/40">
              <Dot tone="rose" label="실패" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={group[0]}>
                {group[0]}
              </span>
              <span className="text-xs tabular-nums text-slate-400">{group[1].length}건</span>
              <button
                type="button"
                onClick={() => retryAll(group)}
                disabled={busy === `group:${group[0]}`}
                className="h-7 rounded-md px-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                모두 재시도
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {group[1].map((job) => (
                <JobRow key={job.id} {...rowProps(job)} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <>
          {jobs.length > 0 && (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {jobs.map((job) => (
                <JobRow key={job.id} {...rowProps(job)} />
              ))}
            </ul>
          )}
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { PATHS } from "../../../routes/path";
import { ADMIN_TABS } from "../adminTabs";
import { exactTime, relativeTime, scheduleLabel } from "../adminFormat";


const DOT = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-300 dark:bg-slate-600",
};

function Signal({ tone, tip, children }) {
  return (
    <span title={tip} className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  );
}

/** 파이프라인이 멈췄는지 한눈에. 누르면 운영 탭. */
function StatusBlock({ summary, onNavigate }) {
  if (!summary) return <div className="mt-3 h-[88px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />;
  const { dead, pending, resumeAt, lastFetchedAt, failingBlogs, activeBlogs } = summary;
  const fetchTip = [
    lastFetchedAt && `마지막 RSS 수집 ${exactTime(lastFetchedAt)}`,
    `블로그 ${activeBlogs}개 중 ${activeBlogs - failingBlogs}개 정상`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <NavLink
      to={`${PATHS.ADMIN}/ops`}
      onClick={onNavigate}
      aria-label="파이프라인 상태 · 운영"
      className="mt-3 block rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <span className="flex flex-col gap-2 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
      <Signal tone={dead ? "rose" : "slate"} tip={`실패한 잡 ${dead}개`}>
        실패 {dead}
      </Signal>
      <Signal
        tone={pending ? "amber" : "slate"}
        tip={resumeAt ? `대기 ${pending}개 · ${exactTime(resumeAt)} 재개` : `대기 ${pending}개`}
      >
        대기 {pending}
        {resumeAt && <span className="text-slate-400 dark:text-slate-500">· {scheduleLabel(resumeAt)}</span>}
      </Signal>
      <Signal tone={failingBlogs ? "amber" : "emerald"} tip={fetchTip}>
        수집 {relativeTime(lastFetchedAt)}
        {failingBlogs > 0 && (
          <span className="text-slate-400 dark:text-slate-500">· 실패 {failingBlogs}</span>
        )}
      </Signal>
      </span>
    </NavLink>
  );
}

export default function AdminSidebar({ summary, onNavigate }) {
  return (
    <nav aria-label="관리" className="flex flex-col gap-1">
      {ADMIN_TABS.map((tab) => {
        const count = summary?.counts?.[tab.id];
        return (
          <NavLink
            key={tab.id}
            to={`${PATHS.ADMIN}/${tab.id}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex h-10 items-center rounded-lg px-3 ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/15"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            {/* 전역 `a` 규칙이 글자색·굵기를 덮으므로 안쪽 span에 준다. */}
            {({ isActive }) => (
              <span
                className={`flex w-full items-center gap-2.5 text-sm font-semibold ${
                  isActive
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                {count != null && (
                  <span className="ml-auto text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                    {count.toLocaleString()}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        );
      })}
      <StatusBlock summary={summary} onNavigate={onNavigate} />
    </nav>
  );
}

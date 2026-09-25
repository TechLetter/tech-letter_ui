import { Link } from "react-router-dom";
import { RiArrowRightSLine, RiExternalLinkLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import timeutils from "../../utils/timeutils";

function ChangeBadge({ current, previous }) {
  if (previous === 0) {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
        새로 등장
      </span>
    );
  }
  const delta = current - previous;
  if (delta === 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        지난주와 같음
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        up
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(delta)}곳
    </span>
  );
}

export default function WeeklyTopicCard({ rank, item }) {
  const topicHref = `${PATHS.HOME}?category=${encodeURIComponent(item.topic)}`;

  return (
    <section
      data-testid="weekly-topic"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-500">{rank}</span>
            {/* 전역 `a` 색이 클래스를 덮으므로 글자색은 안쪽 span에 준다. */}
            <Link to={topicHref} className="group inline-flex items-center gap-0.5">
              <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300">
                {item.topic}
              </span>
              <RiArrowRightSLine className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {item.blog_count}개 회사 · {item.post_count}개 글
            <span className="text-slate-300 dark:text-slate-600"> · </span>
            지난주 {item.previous_blog_count}개 회사
          </p>
        </div>
        <ChangeBadge current={item.blog_count} previous={item.previous_blog_count} />
      </div>

      {item.posts?.length > 0 && (
        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {item.posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-300">
                  {post.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {post.blog_name}
                  <span className="text-slate-300 dark:text-slate-600"> · </span>
                  {timeutils.formatLocalDate(post.published_at)}
                </p>
              </div>
              <RiExternalLinkLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

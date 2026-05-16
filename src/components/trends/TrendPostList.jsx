import { RiExternalLinkLine } from "react-icons/ri";
import timeutils from "../../utils/timeutils";

export default function TrendPostList({
  posts = [],
  loading = false,
  error = "",
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          관련 포스트
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          선택 기준과 같은 기간의 포스트
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-4 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          조건에 맞는 포스트가 없습니다.
        </p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="group block py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300">
                    {post.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{post.blog_name}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{timeutils.formatLocalDate(post.published_at)}</span>
                  </div>
                  {post.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <RiExternalLinkLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

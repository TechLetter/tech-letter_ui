import { Link } from "react-router-dom";
import { RiArrowRightSLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import timeutils from "../../utils/timeutils";
import BlogIcon from "../common/BlogIcon";
import { ChangeBadge } from "../trends/WeeklyTopicCard";

const BOX = "rounded-xl border border-line bg-surface px-4 pt-4 pb-3";
const ROW = "flex h-11 w-full items-center gap-2.5 border-t border-line text-left";

const shortDate = (value) => timeutils.formatLocalDate(value).slice(5);

/** 홈 우측 레일(xl 이상): 이번 주 흐름 + 출처 상위. */
export default function HomeRail({ trends, blogFilters, onSelectCategory, onSelectBlog }) {
  const items = trends?.items || [];
  const topBlogs = blogFilters.slice(0, 8);

  return (
    <aside className="flex flex-col gap-4">
      {items.length > 0 && (
        <section className={BOX}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-ink">이번 주 흐름</h2>
            <span className="font-mono text-xs text-ink-3">
              {shortDate(trends.period.from_at)} – {shortDate(trends.period.to)}
            </span>
          </div>
          <p className="mt-1 mb-2 text-xs text-ink-3">
            {trends.blog_count}개 블로그 · {trends.post_count}개 글
          </p>
          <ol className="flex flex-col">
            {items.map((item, index) => (
              <li key={item.topic}>
                <button type="button" onClick={() => onSelectCategory(item.topic)} className={ROW}>
                  <span className="w-4 font-mono text-xs text-accent-ink">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-accent-ink">
                    {item.topic}
                  </span>
                  <span className="text-xs text-ink-3">{item.blog_count}곳</span>
                  <ChangeBadge current={item.blog_count} previous={item.previous_blog_count} />
                </button>
              </li>
            ))}
          </ol>
          <Link to={PATHS.TRENDS} className="mt-1 flex h-9 items-center gap-0.5">
            <span className="text-[13px] font-semibold text-accent-ink">트렌드 전체 보기</span>
            <RiArrowRightSLine className="h-4 w-4 text-accent-ink" />
          </Link>
        </section>
      )}

      {topBlogs.length > 0 && (
        <section className={BOX}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-ink">출처</h2>
            <span className="text-xs text-ink-3">{blogFilters.length}곳</span>
          </div>
          <div className="mt-2 flex flex-col">
            {topBlogs.map((blog) => (
              <button key={blog.id} type="button" onClick={() => onSelectBlog(blog.id)} className={ROW}>
                <BlogIcon blogId={blog.id} name={blog.name} size={24} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:text-accent-ink">
                  {blog.name}
                </span>
                <span className="font-mono text-xs text-ink-3">{blog.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

/** xl 미만에서 레일 대신 피드 위에 놓는 한 줄. */
export function TrendStrip({ trends, onSelectCategory }) {
  const items = (trends?.items || []).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <div className="mb-4 flex items-center gap-2 xl:hidden">
      <Link to={PATHS.TRENDS} className="shrink-0">
        <span className="text-xs font-semibold text-ink-3 hover:text-accent-ink">이번 주</span>
      </Link>
      <div className="-mr-4 flex min-w-0 flex-1 gap-2 overflow-x-auto pr-4 sm:mr-0 sm:pr-0">
        {items.map((item, index) => (
          <button
            key={item.topic}
            type="button"
            onClick={() => onSelectCategory(item.topic)}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            <span className="font-mono text-accent-ink">{index + 1}</span>
            {item.topic}
            <span className="font-medium text-ink-3">{item.blog_count}곳</span>
          </button>
        ))}
      </div>
    </div>
  );
}

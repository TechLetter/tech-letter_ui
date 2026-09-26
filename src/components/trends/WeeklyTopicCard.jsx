import { Link } from "react-router-dom";
import { RiArrowRightSLine, RiExternalLinkLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import timeutils from "../../utils/timeutils";
import BlogIcon from "../common/BlogIcon";

/** 지난주보다 다룬 블로그가 몇 곳 늘었나. 지난주 숫자는 툴팁으로. */
export function ChangeBadge({ current, previous }) {
  const delta = current - previous;
  const tip = `지난주 ${previous}개 블로그`;
  if (delta === 0) {
    return (
      <span title={tip} className="px-2 font-mono text-[11px] font-semibold text-ink-3">
        –
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      title={tip}
      className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${
        up ? "bg-accent-soft text-accent-ink" : "bg-canvas text-ink-3"
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
      className="rounded-xl border border-line bg-surface px-4 pt-4 pb-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-accent-ink">{rank}</span>
            <Link to={topicHref} className="group inline-flex items-center gap-0.5">
              <span className="text-base font-bold text-ink group-hover:text-accent-ink">{item.topic}</span>
              <RiArrowRightSLine className="h-4 w-4 text-ink-3 group-hover:text-accent-ink" />
            </Link>
          </div>
          <p className="mt-1 text-xs text-ink-3">
            {item.blog_count}개 블로그 · {item.post_count}개 글
          </p>
        </div>
        <ChangeBadge current={item.blog_count} previous={item.previous_blog_count} />
      </div>

      {item.posts?.length > 0 && (
        <div className="mt-3 flex flex-col">
          {item.posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 border-t border-line py-2.5"
            >
              <BlogIcon blogId={post.blog_id} name={post.blog_name} size={20} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-accent-ink">
                  {post.title}
                </span>
                <span className="mt-0.5 text-xs text-ink-3">
                  {post.blog_name}
                  <span className="text-line"> · </span>
                  <span className="font-mono">{timeutils.formatLocalDate(post.published_at)}</span>
                </span>
              </span>
              <RiExternalLinkLine className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-accent-ink" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

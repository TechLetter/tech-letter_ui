import { Link } from "react-router-dom";
import { RiArrowRightSLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import timeutils from "../../utils/timeutils";
import { ChangeBadge } from "../trends/WeeklyTopicCard";

const shortDate = (value) => timeutils.formatLocalDate(value).slice(5);

/**
 * 사이드바 맨 아래 고정 카드 — 이번 주 흐름.
 * 화면 높이 820px 미만이면 제목 한 줄로 접히고, 1000px 이상이면 5개까지 편다.
 */
export default function TrendsCard({ trends, onSelectCategory }) {
  const items = (trends?.items || []).slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section className="flex shrink-0 flex-col rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="flex h-6 items-baseline justify-between">
        <h2 className="text-[13px] font-bold text-ink">이번 주 흐름</h2>
        <span className="font-mono text-[11px] text-ink-3">
          {shortDate(trends.period.from_at)} – {shortDate(trends.period.to)}
        </span>
      </div>
      <ol className="mt-1 flex flex-col [@media(max-height:819px)]:hidden">
        {items.map((item, index) => (
          <li key={item.topic} className={index >= 3 ? "hidden [@media(min-height:1000px)]:block" : ""}>
            <button
              type="button"
              onClick={() => onSelectCategory(item.topic)}
              className="flex h-8 w-full items-center gap-2 rounded-lg px-1.5 text-left text-[13px] hover:bg-canvas"
            >
              <span className="w-3 font-mono text-xs text-accent-ink">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{item.topic}</span>
              <span className="font-mono text-[11px] text-ink-3">({item.blog_count})</span>
              <ChangeBadge current={item.blog_count} previous={item.previous_blog_count} />
            </button>
          </li>
        ))}
      </ol>
      <Link to={PATHS.TRENDS} className="mt-0.5 flex h-7 items-center gap-0.5 px-1.5">
        <span className="text-xs font-semibold text-accent-ink">트렌드 전체 보기</span>
        <RiArrowRightSLine className="h-3.5 w-3.5 text-accent-ink" />
      </Link>
    </section>
  );
}

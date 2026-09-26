import { Link } from "react-router-dom";
import { PATHS } from "../../routes/path";

/** 피드 위 한 줄 — 이번 주 흐름 상위 3개. lg 부터는 사이드바 카드가 대신한다. */
export default function TrendStrip({ trends, onSelectCategory }) {
  const items = (trends?.items || []).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <div className="mb-4 flex items-center gap-2 lg:hidden">
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
            <span className="font-mono font-medium text-ink-3">({item.blog_count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

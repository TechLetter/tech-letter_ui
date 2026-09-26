import BlogPicker from "./BlogPicker";
import TopicPicker from "./TopicPicker";
import TrendsCard from "./TrendsCard";

const CARD = "flex min-h-0 flex-col rounded-xl border border-line bg-surface p-3";

function CardLabel({ children, count }) {
  return (
    <div className="mb-2 flex h-6 shrink-0 items-baseline gap-1.5">
      <span className="text-[13px] font-bold text-ink">{children}</span>
      {count > 0 && <span className="font-mono text-xs text-ink-3">({count})</span>}
    </div>
  );
}

/**
 * 주제 · 출처 · 이번 주 흐름 카드. 부모 높이(사이드바·드로어)를 다 쓰고 목록은 카드 안에서 스크롤한다.
 * 주제 카드는 최대 55% — 자식이 적은 부모면 남는 높이를 출처에 넘긴다. 트렌드는 `trends` 를 줄 때만.
 */
export default function HomeSidebar({
  topicGroups,
  categoryFilters,
  blogFilters,
  activeGroup,
  selectedCategory,
  selectedBlogId,
  onSelectGroup,
  onSelectCategory,
  onChangeBlog,
  trends,
  dense = true,
}) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${dense ? "gap-4" : "gap-3"}`}>
      <section className={`${CARD} max-h-[55%] shrink`}>
        <CardLabel>주제</CardLabel>
        <TopicPicker
          topicGroups={topicGroups}
          categoryFilters={categoryFilters}
          activeGroup={activeGroup}
          selectedCategory={selectedCategory}
          onSelectGroup={onSelectGroup}
          onSelectCategory={onSelectCategory}
          dense={dense}
        />
      </section>
      {/* 출처는 최소 4행(약 236px)은 보이게 — 그만큼 주제 카드가 먼저 줄어든다. */}
      <section className={`${CARD} min-h-[236px] flex-1`}>
        <CardLabel count={blogFilters.length}>출처</CardLabel>
        <BlogPicker
          blogFilters={blogFilters}
          selectedBlogId={selectedBlogId}
          onChangeBlog={onChangeBlog}
          dense={dense}
        />
      </section>
      {trends && <TrendsCard trends={trends} onSelectCategory={onSelectCategory} />}
    </div>
  );
}

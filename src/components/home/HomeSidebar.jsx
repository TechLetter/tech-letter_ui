import BlogPicker from "./BlogPicker";
import TopicTree from "./TopicTree";

function SectionLabel({ children, right }) {
  return (
    <div className="flex h-7 items-baseline justify-between px-2.5">
      <span className="text-xs font-semibold tracking-wide text-ink-3">{children}</span>
      {right && <span className="text-xs text-ink-3">{right}</span>}
    </div>
  );
}

/** 주제 트리 + 출처 목록. 데스크톱 사이드바와 모바일 드로어가 같은 내용을 쓴다. */
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
  dense = true,
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-1">
        <SectionLabel>주제</SectionLabel>
        <TopicTree
          topicGroups={topicGroups}
          categoryFilters={categoryFilters}
          activeGroup={activeGroup}
          selectedCategory={selectedCategory}
          onSelectGroup={onSelectGroup}
          onSelectCategory={onSelectCategory}
          dense={dense}
        />
      </section>
      <section className="flex flex-col gap-1">
        <SectionLabel right={blogFilters.length ? `${blogFilters.length}곳` : ""}>출처</SectionLabel>
        <BlogPicker
          blogFilters={blogFilters}
          selectedBlogId={selectedBlogId}
          onChangeBlog={onChangeBlog}
          dense={dense}
        />
      </section>
    </div>
  );
}

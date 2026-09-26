import { useState } from "react";
import { RiArrowRightSLine, RiCloseLine, RiMenuLine } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";
import FilterDrawer from "./FilterDrawer";

const ACTIVE_CHIP =
  "flex h-8 items-center gap-1 rounded-full bg-accent-soft pl-2.5 pr-1 text-[13px] font-semibold text-accent-ink";

function RemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent/15"
    >
      <RiCloseLine className="h-3.5 w-3.5" />
    </button>
  );
}

/** 피드 위 툴바 — 현재 주제와 선택 칩. 모바일에서는 드로어를 여는 버튼도 겸한다. */
export default function HomeFilterSection({
  topicGroups = [],
  activeGroup = "",
  selectedCategory = "",
  categoryFilters = [],
  blogFilters = [],
  selectedBlogId = "",
  onSelectGroup,
  onSelectCategory,
  onChangeBlog,
  onClearFilters,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const group = topicGroups.find((item) => item.id === activeGroup) || null;
  const selectedBlog = blogFilters.find((blog) => blog.id === selectedBlogId);
  const hasActive = Boolean(selectedCategory || selectedBlogId);
  const crumb = [group?.name || "전체", selectedCategory].filter(Boolean);

  const sidebarProps = {
    topicGroups,
    categoryFilters,
    blogFilters,
    activeGroup,
    selectedCategory,
    selectedBlogId,
    onSelectGroup,
    onSelectCategory,
    onChangeBlog,
  };

  return (
    <section className="mb-4 flex flex-col gap-3">
      {/* 모바일: 현재 주제 · 출처 */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-accent bg-accent-soft pr-3 pl-2.5 text-sm font-semibold text-accent-ink"
        >
          <RiMenuLine className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{crumb[crumb.length - 1]}</span>
        </button>
        <button
          type="button"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className={`flex h-10 min-w-0 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold ${
            selectedBlog ? "border-accent bg-accent-soft text-accent-ink" : "border-line bg-surface text-ink"
          }`}
        >
          {selectedBlog && <BlogIcon blogId={selectedBlog.id} name={selectedBlog.name} size={20} />}
          <span className="max-w-[7rem] truncate">{selectedBlog?.name || "출처"}</span>
        </button>
      </div>

      {/* 데스크톱: 현재 주제 · 선택 칩 */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <h1 className="flex items-center gap-1 text-lg font-bold tracking-tight text-ink">
          {crumb.map((part, index) => (
            <span key={part} className="flex items-center gap-1">
              {index > 0 && <RiArrowRightSLine className="h-4 w-4 text-ink-3" />}
              {part}
            </span>
          ))}
        </h1>
        {selectedBlogId && (
          <span className={`${ACTIVE_CHIP} ml-2 pl-1.5`}>
            <BlogIcon blogId={selectedBlogId} name={selectedBlog?.name} size={20} />
            {selectedBlog?.name || "출처"}
            <RemoveButton label="출처 해제" onClick={() => onChangeBlog("")} />
          </span>
        )}
        {hasActive && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-8 rounded-lg px-2.5 text-[13px] font-semibold text-ink-3 hover:bg-canvas hover:text-ink"
          >
            초기화
          </button>
        )}
      </div>

      {/* 모바일은 선택 칩을 두지 않는다 — 선택 바가 이미 주제·출처를 보여 준다. 초기화는 드로어에. */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={hasActive ? onClearFilters : null}
        {...sidebarProps}
      />
    </section>
  );
}

import { useMemo, useState } from "react";
import { RiArrowDownSLine, RiArrowRightSLine, RiCheckLine, RiSearchLine } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";

const ROW = "flex h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-[15px]";
const on_ = "bg-accent-soft font-semibold text-accent-ink";
const off = "font-medium text-ink hover:bg-canvas";

function SectionTitle({ children, count }) {
  return (
    <h3 className="flex items-baseline gap-1.5 px-3 pt-4 pb-1.5 text-[13px] font-bold text-ink-3">
      {children}
      {count > 0 && <span className="font-mono text-xs font-medium">({count})</span>}
    </h3>
  );
}

/**
 * 모바일 드로어 내용 — 칩 없이 글자 목록으로. 주제는 부모를 누르면 그 아래로 자식이 펼쳐지고,
 * 출처는 검색 + 목록. 드로어 전체가 한 번에 스크롤된다.
 */
export default function MobileFilterList({
  topicGroups = [],
  categoryFilters = [],
  blogFilters = [],
  activeGroup = "",
  selectedCategory = "",
  selectedBlogId = "",
  onSelectGroup,
  onSelectCategory,
  onChangeBlog,
}) {
  const [query, setQuery] = useState("");
  const countOf = new Map(categoryFilters.map((item) => [item.name, item.count]));
  const blogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? blogFilters.filter((blog) => blog.name.toLowerCase().includes(q)) : blogFilters;
  }, [blogFilters, query]);

  return (
    <nav aria-label="주제 · 출처" className="pb-4">
      <SectionTitle>주제</SectionTitle>
      <button type="button" aria-pressed={!activeGroup} onClick={() => onSelectGroup("")} className={`${ROW} ${!activeGroup ? on_ : off}`}>
        전체
      </button>
      {topicGroups.map((group) => {
        const open = group.id === activeGroup;
        const children = [...group.topics].sort((a, b) => (countOf.get(b) || 0) - (countOf.get(a) || 0));
        return (
          <div key={group.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => onSelectGroup(open ? "" : group.id)}
              className={`${ROW} ${open && !selectedCategory ? on_ : off}`}
            >
              <span className="flex-1">{group.name}</span>
              {open ? <RiArrowDownSLine className="h-5 w-5 text-ink-3" /> : <RiArrowRightSLine className="h-5 w-5 text-ink-3" />}
            </button>
            {open && (
              <div className="ml-4 border-l border-line pl-2">
                {children.map((name) => {
                  const on = name === selectedCategory;
                  const count = countOf.get(name) || 0;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onSelectCategory(on ? "" : name)}
                      className={`${ROW} text-sm ${on ? on_ : count ? "font-medium text-ink-2 hover:bg-canvas" : "font-medium text-ink-3 hover:bg-canvas"}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{name}</span>
                      <span className="font-mono text-xs text-ink-3">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <SectionTitle count={blogFilters.length}>출처</SectionTitle>
      <div className="relative mx-1 mb-1 flex items-center">
        <label htmlFor="drawer-blog-search" className="sr-only">
          블로그 검색
        </label>
        <RiSearchLine aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-ink-3" />
        <input
          id="drawer-blog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="블로그 검색"
          className="h-11 w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-sm text-ink outline-none focus:border-accent [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      {blogs.length === 0 && <p className="py-4 text-center text-sm text-ink-3">결과 없음</p>}
      {blogs.map((blog) => {
        const on = blog.id === selectedBlogId;
        return (
          <button
            key={blog.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChangeBlog(on ? "" : blog.id)}
            className={`${ROW} gap-2.5 text-sm ${on ? on_ : "font-medium text-ink-2 hover:bg-canvas"}`}
          >
            <BlogIcon blogId={blog.id} name={blog.name} size={22} />
            <span className="min-w-0 flex-1 truncate">{blog.name}</span>
            <span className="font-mono text-xs text-ink-3">{blog.count}</span>
            {on && <RiCheckLine className="h-4 w-4" />}
          </button>
        );
      })}
    </nav>
  );
}

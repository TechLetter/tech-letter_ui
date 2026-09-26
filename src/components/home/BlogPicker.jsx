import { useMemo, useState } from "react";
import { RiArrowDownSLine, RiCheckLine, RiSearchLine } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";

const TOP_N = 8;

/** 출처 목록 — 검색 + 아이콘 + 개수. 단일 선택, 상위 8곳만 보이고 '더 보기' 로 전부 편다. */
export default function BlogPicker({ blogFilters = [], selectedBlogId = "", onChangeBlog, dense = true }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const rowH = dense ? "h-10" : "h-11";
  const inputId = dense ? "sidebar-blog-search" : "drawer-blog-search";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return blogFilters.filter((blog) => blog.name.toLowerCase().includes(q));
    if (showAll) return blogFilters;
    // 선택한 출처가 상위 밖이면 함께 보여 준다.
    const top = blogFilters.slice(0, TOP_N);
    const selected = blogFilters.find((blog) => blog.id === selectedBlogId);
    return selected && !top.includes(selected) ? [...top, selected] : top;
  }, [blogFilters, query, showAll, selectedBlogId]);

  const hasMore = !query.trim() && !showAll && blogFilters.length > TOP_N;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="relative mb-1 flex items-center">
        <label htmlFor={inputId} className="sr-only">
          블로그 검색
        </label>
        <RiSearchLine aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-ink-3" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="블로그 검색"
          className={`${rowH} w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-[13px] text-ink outline-none focus:border-accent [&::-webkit-search-cancel-button]:hidden`}
        />
      </div>
      {shown.length === 0 && <p className="py-4 text-center text-[13px] text-ink-3">결과 없음</p>}
      {shown.map((blog) => {
        const on = blog.id === selectedBlogId;
        return (
          <button
            key={blog.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChangeBlog(on ? "" : blog.id)}
            className={`flex ${rowH} w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] ${
              on ? "bg-accent-soft font-semibold text-accent-ink" : "font-medium text-ink-2 hover:bg-canvas"
            }`}
          >
            <BlogIcon blogId={blog.id} name={blog.name} size={24} />
            <span className="min-w-0 flex-1 truncate">{blog.name}</span>
            <span className={`font-mono text-[11px] ${on ? "" : "text-ink-3"}`}>{blog.count}</span>
            {on && (
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-accent-fg">
                <RiCheckLine className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={`flex ${rowH} w-full items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-accent-ink hover:bg-canvas`}
        >
          더 보기
          <RiArrowDownSLine className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

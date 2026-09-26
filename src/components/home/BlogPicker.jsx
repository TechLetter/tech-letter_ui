import { useMemo, useState } from "react";
import { RiCheckLine, RiSearchLine } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";

/** 출처 목록 — 검색 + 아이콘 + 개수. 단일 선택. 목록은 카드 안에서 스크롤한다. */
export default function BlogPicker({ blogFilters = [], selectedBlogId = "", onChangeBlog, dense = true }) {
  const [query, setQuery] = useState("");
  const rowH = dense ? "h-9" : "h-11";
  const inputId = dense ? "sidebar-blog-search" : "drawer-blog-search";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? blogFilters.filter((blog) => blog.name.toLowerCase().includes(q)) : blogFilters;
  }, [blogFilters, query]);

  return (
    <>
      <div className="relative flex shrink-0 items-center">
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
          className={`${dense ? "h-9" : "h-11"} w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-[13px] text-ink outline-none focus:border-accent [&::-webkit-search-cancel-button]:hidden`}
        />
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
        {shown.length === 0 && <p className="py-4 text-center text-[13px] text-ink-3">결과 없음</p>}
        {shown.map((blog) => {
          const on = blog.id === selectedBlogId;
          return (
            <button
              key={blog.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChangeBlog(on ? "" : blog.id)}
              className={`flex ${rowH} w-full shrink-0 items-center gap-2.5 rounded-lg px-2 text-left text-[13px] ${
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
      </div>
    </>
  );
}

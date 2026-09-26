import { useMemo, useState } from "react";
import { RiCheckLine, RiSearchLine } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";

/**
 * 출처·태그 공용 목록. 검색 입력 + 선택 가능한 행.
 * `items` 는 `{ id, name, count }` — 출처는 id 가 blog_id, 태그는 id 가 이름.
 */
export default function FilterList({
  items,
  selected,
  onToggle,
  multiple = false,
  withIcon = false,
  searchLabel,
  rowClass = "h-11",
}) {
  const [query, setQuery] = useState("");
  const inputId = `filter-search-${searchLabel}`;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, query]);

  const isOn = (id) => (multiple ? selected.includes(id) : selected === id);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="relative flex shrink-0 items-center px-3 pt-1 pb-2">
        <label htmlFor={inputId} className="sr-only">
          {searchLabel}
        </label>
        <RiSearchLine aria-hidden="true" className="pointer-events-none absolute left-6 h-4 w-4 text-ink-3" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchLabel}
          className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink outline-none focus:border-accent [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {shown.length === 0 && <p className="py-6 text-center text-sm text-ink-3">결과 없음</p>}
        {shown.map((item) => {
          const on = isOn(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 text-left hover:bg-canvas ${rowClass}`}
            >
              {withIcon && <BlogIcon blogId={item.id} name={item.name} size={24} />}
              <span className={`min-w-0 flex-1 truncate text-sm ${on ? "font-semibold text-ink" : "font-medium text-ink-2"}`}>
                {item.name}
              </span>
              <span className="font-mono text-xs text-ink-3">{item.count}</span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                  multiple ? "rounded-md" : "rounded-full"
                } ${on ? "bg-accent text-accent-fg" : "border border-slate-300 dark:border-slate-600"}`}
              >
                {on && <RiCheckLine className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

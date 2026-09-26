import { useState } from "react";
import { RiCloseLine, RiFilter3Line } from "react-icons/ri";
import BlogIcon from "../common/BlogIcon";
import FilterDropdown from "./FilterDropdown";
import FilterList from "./FilterList";
import FilterSheet from "./FilterSheet";

const TAB =
  "flex h-11 shrink-0 items-center border-b-2 px-3 text-[15px] whitespace-nowrap lg:h-12";
const CHIP =
  "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] whitespace-nowrap";
const SORTS = [
  { value: "", label: "최신순" },
  { value: "views", label: "조회순" },
];
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

export default function HomeFilterSection({
  topicGroups = [],
  activeGroup = "",
  sort = "",
  onChangeSort,
  selectedCategory = "",
  categoryFilters = [],
  blogFilters = [],
  tagFilters = [],
  selectedBlogId = "",
  selectedTags = [],
  onSelectGroup,
  onSelectCategory,
  onChangeBlog,
  onChangeTags,
  onApplyFilters,
  onClearFilters,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const group = topicGroups.find((item) => item.id === activeGroup) || null;
  // 부모를 고르면 그 자식만, '전체' 면 개수순으로 전부 보여 준다.
  const chips = group
    ? categoryFilters.filter((item) => group.topics.includes(item.name))
    : categoryFilters;

  const blogItems = blogFilters.map((blog) => ({ id: blog.id, name: blog.name, count: blog.count }));
  const tagItems = tagFilters.map((tag) => ({ id: tag.name, name: tag.name, count: tag.count }));
  const selectedBlog = blogFilters.find((blog) => blog.id === selectedBlogId);

  const toggleTag = (name) =>
    onChangeTags(selectedTags.includes(name) ? selectedTags.filter((tag) => tag !== name) : [...selectedTags, name]);

  const mobileCount = Number(Boolean(selectedBlogId)) + selectedTags.length;
  const hasActive = Boolean(selectedCategory || selectedBlogId || selectedTags.length);

  return (
    <section className="mb-4 flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 border-b border-line">
        <div role="tablist" aria-label="주제" className="-mb-px flex min-w-0 gap-0.5 overflow-x-auto">
          {[{ id: "", name: "전체" }, ...topicGroups].map(({ id, name: label }) => {
            const on = id === activeGroup;
            return (
              <button
                key={id || "all"}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onSelectGroup(id)}
                className={`${TAB} ${
                  on
                    ? "border-accent font-semibold text-ink"
                    : "border-transparent font-medium text-ink-3 hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 pb-2 md:flex">
          <FilterDropdown label="출처" activeCount={selectedBlogId ? 1 : 0}>
            {({ close }) => (
              <FilterList
                items={blogItems}
                selected={selectedBlogId}
                onToggle={(id) => {
                  onChangeBlog(id === selectedBlogId ? "" : id);
                  close();
                }}
                withIcon
                searchLabel="블로그 검색"
              />
            )}
          </FilterDropdown>
          <FilterDropdown label="태그" activeCount={selectedTags.length}>
            {() => (
              <FilterList items={tagItems} selected={selectedTags} onToggle={toggleTag} multiple searchLabel="태그 검색" />
            )}
          </FilterDropdown>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0">
          {group && (
            <button
              type="button"
              aria-pressed={!selectedCategory}
              onClick={() => onSelectCategory("")}
              className={`${CHIP} ${
                !selectedCategory
                  ? "border-accent bg-accent-soft font-semibold text-accent-ink"
                  : "border-line bg-surface font-medium text-ink-2 hover:bg-canvas"
              }`}
            >
              전체
            </button>
          )}
          {chips.map((item) => {
            const on = item.name === selectedCategory;
            return (
              <button
                key={item.name}
                type="button"
                aria-pressed={on}
                onClick={() => onSelectCategory(on ? "" : item.name)}
                className={`${CHIP} ${
                  on
                    ? "border-accent bg-accent-soft font-semibold text-accent-ink"
                    : "border-line bg-surface font-medium text-ink-2 hover:bg-canvas"
                }`}
              >
                {item.name}
                <span className={`font-mono text-[11px] ${on ? "" : "text-ink-3"}`}>{item.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold md:hidden ${
            mobileCount
              ? "border-accent bg-accent-soft text-accent-ink"
              : "border-line bg-surface text-ink"
          }`}
        >
          <RiFilter3Line className="h-4 w-4" />
          출처 · 태그
          {mobileCount > 0 && <span className="font-mono text-xs">{mobileCount}</span>}
        </button>

        {selectedCategory && (
          <span className={ACTIVE_CHIP}>
            {selectedCategory}
            <RemoveButton label="주제 해제" onClick={() => onSelectCategory("")} />
          </span>
        )}
        {selectedBlogId && (
          <span className={`${ACTIVE_CHIP} pl-1.5`}>
            <BlogIcon blogId={selectedBlogId} name={selectedBlog?.name} size={20} />
            {selectedBlog?.name || "출처"}
            <RemoveButton label="출처 해제" onClick={() => onChangeBlog("")} />
          </span>
        )}
        {selectedTags.map((tag) => (
          <span key={tag} className={ACTIVE_CHIP}>
            {tag}
            <RemoveButton label={`${tag} 해제`} onClick={() => toggleTag(tag)} />
          </span>
        ))}
        {hasActive && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-8 rounded-lg px-2.5 text-[13px] font-semibold text-ink-3 hover:bg-canvas hover:text-ink"
          >
            초기화
          </button>
        )}

        <div role="group" aria-label="정렬" className="ml-auto flex rounded-lg border border-line bg-surface p-0.5">
          {SORTS.map(({ value, label }) => {
            const on = value === (sort === "views" ? "views" : "");
            return (
              <button
                key={value || "latest"}
                type="button"
                aria-pressed={on}
                onClick={() => onChangeSort(value)}
                className={`h-8 rounded-md px-2.5 text-[13px] ${
                  on ? "bg-accent-soft font-semibold text-accent-ink" : "font-medium text-ink-3 hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        blogFilters={blogItems}
        tagFilters={tagItems}
        selectedBlogId={selectedBlogId}
        selectedTags={selectedTags}
        onApply={(draft) => {
          onApplyFilters(draft);
          setSheetOpen(false);
        }}
      />
    </section>
  );
}

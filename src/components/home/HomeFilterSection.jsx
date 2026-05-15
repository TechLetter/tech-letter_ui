import React, { useMemo, useState } from "react";
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiCloseLine,
  RiFilter3Line,
  RiListCheck2,
  RiNewspaperLine,
  RiPriceTag3Line,
  RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";

const PANEL_TABS = [
  { id: "category", label: "관심 주제", icon: RiListCheck2 },
  { id: "blog", label: "출처", icon: RiNewspaperLine },
  { id: "tag", label: "태그", icon: RiPriceTag3Line },
];

export default function HomeFilterSection({
  categoryFilters = [],
  blogFilters = [],
  tagFilters = [],
  selectedCategory = "",
  selectedBlogId = "",
  selectedTags = [],
  onChangeCategory,
  onChangeBlog,
  onChangeTags,
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  const [blogSearchText, setBlogSearchText] = useState("");

  const selectedBlog = useMemo(
    () => blogFilters.find((blog) => blog.id === selectedBlogId),
    [blogFilters, selectedBlogId]
  );
  const activeFilterCount =
    Number(Boolean(selectedCategory)) +
    Number(Boolean(selectedBlogId)) +
    selectedTags.length;
  const popularCategories = useMemo(
    () => categoryFilters.slice(0, 8),
    [categoryFilters]
  );
  const filteredBlogs = useMemo(() => {
    const query = blogSearchText.trim().toLowerCase();
    if (!query) return blogFilters;
    return blogFilters.filter((blog) =>
      blog.name.toLowerCase().includes(query)
    );
  }, [blogFilters, blogSearchText]);

  const clearAllFilters = () => {
    onChangeCategory("");
    onChangeBlog("");
    onChangeTags([]);
    setBlogSearchText("");
  };

  const selectCategory = (categoryName) => {
    onChangeCategory(categoryName);
    setIsPanelOpen(false);
  };

  const selectBlog = (blogId) => {
    onChangeBlog(blogId);
    setIsPanelOpen(false);
  };

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onChangeTags(selectedTags.filter((tag) => tag !== tagName));
      return;
    }
    onChangeTags([...selectedTags, tagName]);
  };

  const removeTag = (tagName) => {
    onChangeTags(selectedTags.filter((tag) => tag !== tagName));
  };

  const renderActiveFilters = () => {
    if (activeFilterCount === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        {selectedCategory && (
          <ActiveFilterChip
            label="주제"
            value={selectedCategory}
            onRemove={() => onChangeCategory("")}
          />
        )}
        {selectedBlogId && (
          <ActiveFilterChip
            label="출처"
            value={selectedBlog?.name || "선택한 출처"}
            onRemove={() => onChangeBlog("")}
          />
        )}
        {selectedTags.map((tag) => (
          <ActiveFilterChip
            key={tag}
            label="태그"
            value={tag}
            onRemove={() => removeTag(tag)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="relative mb-6 w-full">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <RiListCheck2 className="h-4 w-4" />
              <span>관심 주제</span>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <QuickFilterButton
                label="전체 주제"
                isSelected={!selectedCategory}
                onClick={() => onChangeCategory("")}
              />
              {popularCategories.map((category) => (
                <QuickFilterButton
                  key={category.name}
                  label={category.name}
                  count={category.count}
                  isSelected={selectedCategory === category.name}
                  onClick={() => onChangeCategory(category.name)}
                />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RiRefreshLine className="h-4 w-4" />
                <span>초기화</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPanelOpen((prev) => !prev)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              aria-expanded={isPanelOpen}
            >
              <RiFilter3Line className="h-4 w-4" />
              <span>필터</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 text-xs">
                  {activeFilterCount}
                </span>
              )}
              <RiArrowDownSLine
                className={`h-4 w-4 transition-transform ${
                  isPanelOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {renderActiveFilters()}
      </div>

      {isPanelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 sm:hidden"
          onClick={() => setIsPanelOpen(false)}
          aria-label="필터 닫기"
        />
      )}

      {isPanelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:bottom-auto sm:top-full sm:z-30 sm:mt-3 sm:max-h-none sm:max-w-3xl sm:rounded-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <RiFilter3Line className="h-4 w-4" />
              <span>포스트 필터</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPanelOpen(false)}
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="필터 닫기"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>
          </div>

          <div className="grid max-h-[calc(82vh-57px)] overflow-hidden sm:max-h-[520px] sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 dark:border-slate-700 sm:flex-col sm:border-b-0 sm:border-r">
              {PANEL_TABS.map((tab) => (
                <PanelTabButton
                  key={tab.id}
                  tab={tab}
                  isSelected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>

            <div className="min-h-0 overflow-y-auto p-4">
              {activeTab === "category" && (
                <CategoryPanel
                  categories={categoryFilters}
                  selectedCategory={selectedCategory}
                  onSelectCategory={selectCategory}
                />
              )}
              {activeTab === "blog" && (
                <BlogPanel
                  blogs={filteredBlogs}
                  searchText={blogSearchText}
                  selectedBlogId={selectedBlogId}
                  onChangeSearchText={setBlogSearchText}
                  onSelectBlog={selectBlog}
                />
              )}
              {activeTab === "tag" && (
                <TagPanel
                  tags={tagFilters}
                  selectedTags={selectedTags}
                  onToggleTag={toggleTag}
                  onClearTags={() => onChangeTags([])}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function QuickFilterButton({ label, count, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
        isSelected
          ? "border-slate-900 bg-slate-900 text-white dark:border-indigo-400 dark:bg-indigo-500"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
      }`}
    >
      <span className="max-w-[9rem] truncate">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs opacity-70">{count}</span>
      )}
    </button>
  );
}

function ActiveFilterChip({ label, value, onRemove }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
      <span className="text-indigo-500 dark:text-indigo-400">{label}</span>
      <span className="max-w-[12rem] truncate">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-indigo-500 transition-colors hover:bg-indigo-100 hover:text-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900"
        aria-label={`${value} 필터 해제`}
      >
        <RiCloseLine className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function PanelTabButton({ tab, isSelected, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors sm:justify-start ${
        isSelected
          ? "bg-slate-900 text-white dark:bg-indigo-500"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{tab.label}</span>
    </button>
  );
}

function CategoryPanel({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <FilterOptionButton
          label="전체 주제"
          isSelected={!selectedCategory}
          onClick={() => onSelectCategory("")}
        />
        {categories.map((category) => (
          <FilterOptionButton
            key={category.name}
            label={category.name}
            count={category.count}
            isSelected={selectedCategory === category.name}
            onClick={() => onSelectCategory(category.name)}
          />
        ))}
      </div>
      {categories.length === 0 && <EmptyFilterState label="주제 없음" />}
    </div>
  );
}

function BlogPanel({
  blogs,
  searchText,
  selectedBlogId,
  onChangeSearchText,
  onSelectBlog,
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchText}
          onChange={(event) => onChangeSearchText(event.target.value)}
          placeholder="출처 검색"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <FilterOptionButton
          label="전체 출처"
          isSelected={!selectedBlogId}
          onClick={() => onSelectBlog("")}
          align="left"
        />
        {blogs.map((blog) => (
          <FilterOptionButton
            key={blog.id}
            label={blog.name}
            count={blog.count}
            isSelected={selectedBlogId === blog.id}
            onClick={() => onSelectBlog(blog.id)}
            align="left"
          />
        ))}
      </div>
      {blogs.length === 0 && <EmptyFilterState label="출처 없음" />}
    </div>
  );
}

function TagPanel({ tags, selectedTags, onToggleTag, onClearTags }) {
  return (
    <div className="space-y-3">
      {selectedTags.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearTags}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RiRefreshLine className="h-3.5 w-3.5" />
            태그 초기화
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tags.map((tag) => (
          <FilterOptionButton
            key={tag.name}
            label={tag.name}
            count={tag.count}
            isSelected={selectedTags.includes(tag.name)}
            onClick={() => onToggleTag(tag.name)}
          />
        ))}
      </div>
      {tags.length === 0 && <EmptyFilterState label="태그 없음" />}
    </div>
  );
}

function FilterOptionButton({
  label,
  count,
  isSelected,
  onClick,
  align = "center",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
        align === "left" ? "justify-between text-left" : "justify-center"
      } ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {typeof count === "number" && (
          <span className="text-xs opacity-70">{count}</span>
        )}
        {isSelected && <RiCheckLine className="h-4 w-4" />}
      </span>
    </button>
  );
}

function EmptyFilterState({ label }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {label}
    </div>
  );
}

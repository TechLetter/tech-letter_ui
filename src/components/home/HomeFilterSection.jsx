import React, { useEffect, useMemo, useState } from "react";
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

const FILTER_TABS = [
  { id: "category", label: "주제", icon: RiListCheck2 },
  { id: "blog", label: "출처", icon: RiNewspaperLine },
  { id: "tag", label: "태그", icon: RiPriceTag3Line },
];
const DESKTOP_FILTER_PANEL_MAX_HEIGHT = "max-h-[min(28rem,calc(100vh-7rem))]";
const FILTER_OPTION_GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-3";
const DESKTOP_FILTER_OPTION_SCROLL_CLASS =
  "max-h-[18rem] overflow-y-auto pr-1";
const MOBILE_FILTER_OPTION_SCROLL_CLASS = "overflow-visible";

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
  onApplyFilters,
  onClearFilters,
}) {
  const [openDesktopPanel, setOpenDesktopPanel] = useState(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [desktopCategorySearchText, setDesktopCategorySearchText] =
    useState("");
  const [desktopBlogSearchText, setDesktopBlogSearchText] = useState("");
  const [desktopTagSearchText, setDesktopTagSearchText] = useState("");
  const [mobileCategorySearchText, setMobileCategorySearchText] = useState("");
  const [mobileBlogSearchText, setMobileBlogSearchText] = useState("");
  const [mobileTagSearchText, setMobileTagSearchText] = useState("");
  const [mobileActiveTab, setMobileActiveTab] = useState("category");
  const [draftCategory, setDraftCategory] = useState(selectedCategory);
  const [draftBlogId, setDraftBlogId] = useState(selectedBlogId);
  const [draftTags, setDraftTags] = useState(selectedTags);

  const selectedBlog = useMemo(
    () => blogFilters.find((blog) => blog.id === selectedBlogId),
    [blogFilters, selectedBlogId]
  );
  const selectedBlogDisplay = selectedBlogId
    ? selectedBlog || { name: "선택한 출처" }
    : null;
  const draftBlog = useMemo(
    () => blogFilters.find((blog) => blog.id === draftBlogId),
    [blogFilters, draftBlogId]
  );
  const draftBlogDisplay = draftBlogId ? draftBlog || { name: "선택한 출처" } : null;
  const activeFilterCount =
    Number(Boolean(selectedCategory)) +
    Number(Boolean(selectedBlogId)) +
    selectedTags.length;
  const draftFilterCount =
    Number(Boolean(draftCategory)) + Number(Boolean(draftBlogId)) + draftTags.length;
  const desktopFilteredCategories = useFilteredNamedOptions(
    categoryFilters,
    desktopCategorySearchText
  );
  const desktopFilteredBlogs = useFilteredBlogs(
    blogFilters,
    desktopBlogSearchText
  );
  const desktopFilteredTags = useFilteredNamedOptions(
    tagFilters,
    desktopTagSearchText
  );
  const mobileFilteredCategories = useFilteredNamedOptions(
    categoryFilters,
    mobileCategorySearchText
  );
  const mobileFilteredBlogs = useFilteredBlogs(blogFilters, mobileBlogSearchText);
  const mobileFilteredTags = useFilteredNamedOptions(
    tagFilters,
    mobileTagSearchText
  );

  useEffect(() => {
    if (!isMobileSheetOpen) return;
    setDraftCategory(selectedCategory);
    setDraftBlogId(selectedBlogId);
    setDraftTags(selectedTags);
    setMobileCategorySearchText("");
    setMobileBlogSearchText("");
    setMobileTagSearchText("");
  }, [isMobileSheetOpen, selectedCategory, selectedBlogId, selectedTags]);

  const toggleDesktopPanel = (panelId) => {
    setOpenDesktopPanel((current) => (current === panelId ? null : panelId));
  };

  const clearAllFilters = () => {
    onClearFilters();
    setOpenDesktopPanel(null);
    setDesktopCategorySearchText("");
    setDesktopBlogSearchText("");
    setDesktopTagSearchText("");
    setDraftCategory("");
    setDraftBlogId("");
    setDraftTags([]);
    setMobileCategorySearchText("");
    setMobileBlogSearchText("");
    setMobileTagSearchText("");
  };

  const openMobileSheet = () => {
    setMobileActiveTab("category");
    setIsMobileSheetOpen(true);
  };

  const applyMobileFilters = () => {
    onApplyFilters({
      category: draftCategory,
      blogId: draftBlogId,
      tags: draftTags,
    });
    setIsMobileSheetOpen(false);
  };

  const clearMobileDraft = () => {
    clearAllFilters();
  };

  const toggleDesktopTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onChangeTags(selectedTags.filter((tag) => tag !== tagName));
      return;
    }
    onChangeTags([...selectedTags, tagName]);
  };

  const toggleDraftTag = (tagName) => {
    if (draftTags.includes(tagName)) {
      setDraftTags(draftTags.filter((tag) => tag !== tagName));
      return;
    }
    setDraftTags([...draftTags, tagName]);
  };

  return (
    <section className="relative mb-2 w-full">
      <div className="-mx-1 flex items-center gap-2 overflow-hidden px-1 pb-1 md:hidden">
        <button
          type="button"
          onClick={openMobileSheet}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200/70 transition-all active:scale-[0.98] dark:shadow-indigo-950/50"
          aria-expanded={isMobileSheetOpen}
        >
          <RiFilter3Line className="h-4 w-4" />
          <span>필터</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 ? (
          <>
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            >
              <RiRefreshLine className="h-3.5 w-3.5" />
              초기화
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <ActiveFilterSummary
                maxVisibleCount={1}
                selectedCategory={selectedCategory}
                selectedBlog={selectedBlogDisplay}
                selectedTags={selectedTags}
                onClearCategory={() => onChangeCategory("")}
                onClearBlog={() => onChangeBlog("")}
                onClearTag={(tagName) =>
                  onChangeTags(selectedTags.filter((tag) => tag !== tagName))
                }
              />
            </div>
          </>
        ) : (
          <FilterStateChip label="전체" />
        )}
      </div>

      <FloatingFilterDock
        activeFilterCount={activeFilterCount}
        openPanel={openDesktopPanel}
        selectedCategory={selectedCategory}
        selectedBlog={selectedBlogDisplay}
        selectedTags={selectedTags}
        onTogglePanel={toggleDesktopPanel}
        onClearAll={clearAllFilters}
        onClearCategory={() => onChangeCategory("")}
        onClearBlog={() => onChangeBlog("")}
        onClearTag={(tagName) =>
          onChangeTags(selectedTags.filter((tag) => tag !== tagName))
        }
      />

      {openDesktopPanel && (
        <button
          type="button"
          className="fixed inset-0 z-30 hidden cursor-default md:block"
          onClick={() => setOpenDesktopPanel(null)}
          aria-label="필터 닫기"
        />
      )}

      {openDesktopPanel && (
        <div
          className={`fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-1/2 z-50 hidden w-[min(100%,42rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/50 md:block ${DESKTOP_FILTER_PANEL_MAX_HEIGHT}`}
        >
          {openDesktopPanel === "category" && (
            <CategoryOptions
              categories={desktopFilteredCategories}
              optionScrollClassName={DESKTOP_FILTER_OPTION_SCROLL_CLASS}
              searchText={desktopCategorySearchText}
              selectedCategory={selectedCategory}
              onChangeSearchText={setDesktopCategorySearchText}
              onSelectCategory={(categoryName) => {
                onChangeCategory(categoryName);
                setOpenDesktopPanel(null);
              }}
            />
          )}
          {openDesktopPanel === "blog" && (
            <BlogOptions
              blogs={desktopFilteredBlogs}
              optionScrollClassName={DESKTOP_FILTER_OPTION_SCROLL_CLASS}
              searchText={desktopBlogSearchText}
              selectedBlogId={selectedBlogId}
              onChangeSearchText={setDesktopBlogSearchText}
              onSelectBlog={(blogId) => {
                onChangeBlog(blogId);
                setOpenDesktopPanel(null);
              }}
            />
          )}
          {openDesktopPanel === "tag" && (
            <TagOptions
              tags={desktopFilteredTags}
              optionScrollClassName={DESKTOP_FILTER_OPTION_SCROLL_CLASS}
              searchText={desktopTagSearchText}
              selectedTags={selectedTags}
              onChangeSearchText={setDesktopTagSearchText}
              onToggleTag={toggleDesktopTag}
              onClearTags={() => onChangeTags([])}
            />
          )}
        </div>
      )}

      {isMobileSheetOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={() => setIsMobileSheetOpen(false)}
          aria-label="필터 닫기"
        />
      )}

      {isMobileSheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 md:hidden">
          <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <RiFilter3Line className="h-4 w-4 text-indigo-500" />
              포스트 필터
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="필터 닫기"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>
          </div>

          <div className="relative z-20 flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            {FILTER_TABS.map((tab) => (
              <SheetTabButton
                key={tab.id}
                tab={tab}
                isSelected={mobileActiveTab === tab.id}
                onClick={() => setMobileActiveTab(tab.id)}
              />
            ))}
          </div>

          <div className="relative z-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {mobileActiveTab === "category" && (
              <CategoryOptions
                categories={mobileFilteredCategories}
                optionScrollClassName={MOBILE_FILTER_OPTION_SCROLL_CLASS}
                searchText={mobileCategorySearchText}
                selectedCategory={draftCategory}
                onChangeSearchText={setMobileCategorySearchText}
                onSelectCategory={setDraftCategory}
              />
            )}
            {mobileActiveTab === "blog" && (
              <BlogOptions
                blogs={mobileFilteredBlogs}
                optionScrollClassName={MOBILE_FILTER_OPTION_SCROLL_CLASS}
                searchText={mobileBlogSearchText}
                selectedBlogId={draftBlogId}
                onChangeSearchText={setMobileBlogSearchText}
                onSelectBlog={setDraftBlogId}
              />
            )}
            {mobileActiveTab === "tag" && (
              <TagOptions
                tags={mobileFilteredTags}
                optionScrollClassName={MOBILE_FILTER_OPTION_SCROLL_CLASS}
                searchText={mobileTagSearchText}
                selectedTags={draftTags}
                onChangeSearchText={setMobileTagSearchText}
                onToggleTag={toggleDraftTag}
                onClearTags={() => setDraftTags([])}
              />
            )}
          </div>

          <div className="relative z-20 shrink-0 border-t border-slate-200 bg-white px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex min-h-8 gap-2 overflow-hidden">
              {draftFilterCount > 0 ? (
                <ActiveFilterSummary
                  maxVisibleCount={2}
                  selectedCategory={draftCategory}
                  selectedBlog={draftBlogDisplay}
                  selectedTags={draftTags}
                  onClearCategory={() => setDraftCategory("")}
                  onClearBlog={() => setDraftBlogId("")}
                  onClearTag={(tagName) =>
                    setDraftTags(draftTags.filter((tag) => tag !== tagName))
                  }
                />
              ) : (
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  선택된 필터가 없습니다.
                </span>
              )}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2">
              <button
                type="button"
                onClick={clearMobileDraft}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={applyMobileFilters}
                className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-sm shadow-indigo-200/70 dark:shadow-indigo-950/50"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function useFilteredBlogs(blogs, searchText) {
  return useFilteredNamedOptions(blogs, searchText);
}

function useFilteredNamedOptions(options, searchText) {
  return useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.name.toLowerCase().includes(query));
  }, [options, searchText]);
}

function FloatingFilterDock({
  activeFilterCount,
  openPanel,
  selectedCategory,
  selectedBlog,
  selectedTags,
  onTogglePanel,
  onClearAll,
  onClearCategory,
  onClearBlog,
  onClearTag,
}) {
  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-40 hidden w-[min(44rem,calc(100vw-3rem))] -translate-x-1/2 md:block">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 shadow-xl shadow-slate-300/40 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-slate-950/50">
        <div className="flex shrink-0 items-center gap-1.5">
          {FILTER_TABS.map((tab) => (
            <DesktopFilterButton
              key={tab.id}
              tab={tab}
              isOpen={openPanel === tab.id}
              onClick={() => onTogglePanel(tab.id)}
            />
          ))}
        </div>

        <div className="h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {activeFilterCount > 0 ? (
            <ActiveFilterSummary
              maxVisibleCount={1}
              selectedCategory={selectedCategory}
              selectedBlog={selectedBlog}
              selectedTags={selectedTags}
              onClearCategory={onClearCategory}
              onClearBlog={onClearBlog}
              onClearTag={onClearTag}
            />
          ) : (
            <FilterStateChip label="전체" />
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <RiRefreshLine className="h-3.5 w-3.5" />
            초기화
          </button>
        )}
      </div>
    </div>
  );
}

function FilterStateChip({ label }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      {label}
    </span>
  );
}

function DesktopFilterButton({ tab, isOpen, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition-colors ${
        isOpen
          ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      {tab.label}
      <RiArrowDownSLine
        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function SheetTabButton({ tab, isSelected, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
        isSelected
          ? "border-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      {tab.label}
    </button>
  );
}

function ActiveFilterSummary({
  maxVisibleCount,
  selectedCategory,
  selectedBlog,
  selectedTags,
  onClearCategory,
  onClearBlog,
  onClearTag,
}) {
  const items = getActiveFilterItems({
    selectedCategory,
    selectedBlog,
    selectedTags,
    onClearCategory,
    onClearBlog,
    onClearTag,
  });
  const visibleCount =
    typeof maxVisibleCount === "number" ? maxVisibleCount : items.length;
  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return (
    <>
      {visibleItems.map((item) => (
        <ActiveFilterChip
          key={item.key}
          label={item.label}
          value={item.value}
          onClear={item.onClear}
        />
      ))}
      {hiddenItems.length > 0 && (
        <HiddenFilterCountChip
          count={hiddenItems.length}
          hiddenLabels={hiddenItems.map((item) => `${item.label} ${item.value}`)}
        />
      )}
    </>
  );
}

function getActiveFilterItems({
  selectedCategory,
  selectedBlog,
  selectedTags,
  onClearCategory,
  onClearBlog,
  onClearTag,
}) {
  const items = [];

  if (selectedCategory) {
    items.push({
      key: "category",
      label: "주제",
      value: selectedCategory,
      onClear: onClearCategory,
    });
  }

  if (selectedBlog) {
    items.push({
      key: "blog",
      label: "출처",
      value: selectedBlog.name,
      onClear: onClearBlog,
    });
  }

  selectedTags.forEach((tag) => {
    items.push({
      key: `tag:${tag}`,
      label: "태그",
      value: tag,
      onClear: () => onClearTag(tag),
    });
  });

  return items;
}

function ActiveFilterChip({ label, value, onClear }) {
  return (
    <span className="inline-flex h-8 max-w-full shrink-0 items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300">
      <span className="text-indigo-500 dark:text-indigo-400">{label}</span>
      <span className="max-w-[4.5rem] truncate sm:max-w-[8rem] lg:max-w-[11rem]">
        {value}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900"
        aria-label={`${value} 필터 해제`}
      >
        <RiCloseLine className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function HiddenFilterCountChip({ count, hiddenLabels }) {
  return (
    <span
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      title={hiddenLabels.join(", ")}
      aria-label={`${count}개 필터 더 있음`}
    >
      +{count}
    </span>
  );
}

function CategoryOptions({
  categories,
  optionScrollClassName = DESKTOP_FILTER_OPTION_SCROLL_CLASS,
  searchText,
  selectedCategory,
  onChangeSearchText,
  onSelectCategory,
}) {
  return (
    <div className="space-y-3">
      <FilterSearchInput
        value={searchText}
        onChange={onChangeSearchText}
        placeholder="주제 검색"
      />
      <div className={optionScrollClassName}>
        <div className={FILTER_OPTION_GRID_CLASS}>
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
          {categories.length === 0 && <EmptyFilterState label="주제 없음" />}
        </div>
      </div>
    </div>
  );
}

function BlogOptions({
  blogs,
  optionScrollClassName = DESKTOP_FILTER_OPTION_SCROLL_CLASS,
  searchText,
  selectedBlogId,
  onChangeSearchText,
  onSelectBlog,
}) {
  return (
    <div className="space-y-3">
      <FilterSearchInput
        value={searchText}
        onChange={onChangeSearchText}
        placeholder="출처 검색"
      />
      <div className={optionScrollClassName}>
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
          {blogs.length === 0 && <EmptyFilterState label="출처 없음" />}
        </div>
      </div>
    </div>
  );
}

function TagOptions({
  tags,
  optionScrollClassName = DESKTOP_FILTER_OPTION_SCROLL_CLASS,
  searchText,
  selectedTags,
  onChangeSearchText,
  onToggleTag,
  onClearTags,
}) {
  return (
    <div className="space-y-3">
      <FilterSearchInput
        value={searchText}
        onChange={onChangeSearchText}
        placeholder="태그 검색"
      />
      {selectedTags.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearTags}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RiRefreshLine className="h-3.5 w-3.5" />
            태그 초기화
          </button>
        </div>
      )}
      <div className={optionScrollClassName}>
        <div className={FILTER_OPTION_GRID_CLASS}>
          {tags.map((tag) => (
            <FilterOptionButton
              key={tag.name}
              label={tag.name}
              count={tag.count}
              isSelected={selectedTags.includes(tag.name)}
              onClick={() => onToggleTag(tag.name)}
            />
          ))}
          {tags.length === 0 && <EmptyFilterState label="태그 없음" />}
        </div>
      </div>
    </div>
  );
}

function FilterSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
      />
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
      className={`flex h-11 min-w-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors ${
        align === "left" ? "justify-between text-left" : "justify-center"
      } ${
        isSelected
          ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
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
    <div className="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {label}
    </div>
  );
}

import { useEffect, useState } from "react";
import { RiArrowRightSLine, RiCloseLine, RiFilterOffLine, RiSearchLine } from "react-icons/ri";
import { bindMobileFilterHandler, unbindMobileFilterHandler } from "../../provider/mobileFilterBridge";
import BlogIcon from "../common/BlogIcon";
import FilterDrawer from "./FilterDrawer";

// 검색 결과는 서버가 최대 100건까지만 모은다(SEARCH_MAX_RESULTS). 그 이상일 수 있다는 뜻으로 +.
const SEARCH_RESULT_CAP = 100;
const countLabel = (total) => (total >= SEARCH_RESULT_CAP ? `${SEARCH_RESULT_CAP}+` : total);

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

/** 피드 위 툴바 — 현재 주제와 선택 칩. 모바일 필터 드로어는 헤더의 햄버거 버튼이 연다. */
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
  searchQuery = "",
  searchTotal = null,
  onCloseSearch,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    bindMobileFilterHandler(() => setDrawerOpen(true));
    return unbindMobileFilterHandler;
  }, []);

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
      {/* 모바일: 현재 주제를 글로 · 고른 출처 · 필터 초기화 */}
      {!searchQuery && (
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <h1 className="flex min-w-0 items-center gap-1 text-base font-bold tracking-tight text-ink">
            {crumb.map((part, index) => (
              <span key={part} className="flex min-w-0 items-center gap-1">
                {index > 0 && <RiArrowRightSLine className="h-4 w-4 shrink-0 text-ink-3" />}
                <span className="truncate">{part}</span>
              </span>
            ))}
          </h1>
          {selectedBlogId && (
            <span className={`${ACTIVE_CHIP} pl-1.5`}>
              <BlogIcon blogId={selectedBlogId} name={selectedBlog?.name} size={20} />
              <span className="max-w-[8rem] truncate">{selectedBlog?.name || "출처"}</span>
              <RemoveButton label="출처 해제" onClick={() => onChangeBlog("")} />
            </span>
          )}
          {hasActive && (
            <ClearFiltersButton onClick={onClearFilters} className="ml-auto" />
          )}
        </div>
      )}

      {/* 검색 중: 모바일에도 검색어 · 결과 수 */}
      {searchQuery && (
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-accent bg-surface pr-1 pl-3">
            <RiSearchLine className="h-4 w-4 shrink-0 text-accent-ink" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{searchQuery}</span>
            {searchTotal !== null && <span className="font-mono text-xs text-ink-3">({countLabel(searchTotal)})</span>}
            <button type="button" aria-label="검색 닫기" onClick={onCloseSearch} className="flex h-8 w-8 items-center justify-center text-ink-3">
              <RiCloseLine className="h-4 w-4" />
            </button>
          </span>
        </div>
      )}

      {/* 데스크톱: 현재 주제(또는 검색어) · 선택 칩 */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        {searchQuery ? (
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            ‘{searchQuery}’
            {searchTotal !== null && <span className="font-mono text-sm font-medium text-ink-3">({countLabel(searchTotal)})</span>}
            <span className="pl-1 text-xs font-medium text-ink-3">관련순</span>
          </h1>
        ) : (
          <h1 className="flex items-center gap-1 text-lg font-bold tracking-tight text-ink">
            {crumb.map((part, index) => (
              <span key={part} className="flex items-center gap-1">
                {index > 0 && <RiArrowRightSLine className="h-4 w-4 text-ink-3" />}
                {part}
              </span>
            ))}
          </h1>
        )}
        {selectedBlogId && (
          <span className={`${ACTIVE_CHIP} ml-2 pl-1.5`}>
            <BlogIcon blogId={selectedBlogId} name={selectedBlog?.name} size={20} />
            {selectedBlog?.name || "출처"}
            <RemoveButton label="출처 해제" onClick={() => onChangeBlog("")} />
          </span>
        )}
        {hasActive && (
          <ClearFiltersButton onClick={onClearFilters} />
        )}
        {searchQuery && (
          <button
            type="button"
            onClick={onCloseSearch}
            className="ml-auto flex h-8 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-ink-3 hover:bg-canvas hover:text-ink"
          >
            <RiCloseLine className="h-3.5 w-3.5" />
            검색 닫기
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

/** 필터 초기화. 글자 대신 "필터 끄기" 아이콘을 쓴다. (x)는 옆 출처 칩의 "출처 해제"와 헷갈린다. */
function ClearFiltersButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="필터 초기화"
      title="필터 초기화"
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink ${className}`}
    >
      <RiFilterOffLine className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

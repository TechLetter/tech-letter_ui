import { useEffect, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import FilterList from "./FilterList";

/** 모바일 출처·태그 시트. 고른 값은 '적용' 을 눌러야 반영된다. */
export default function FilterSheet({
  open,
  onClose,
  blogFilters,
  tagFilters,
  selectedBlogId,
  selectedTags,
  onApply,
}) {
  const [tab, setTab] = useState("blog");
  const [draftBlogId, setDraftBlogId] = useState(selectedBlogId);
  const [draftTags, setDraftTags] = useState(selectedTags);

  useEffect(() => {
    if (!open) return;
    setTab("blog");
    setDraftBlogId(selectedBlogId);
    setDraftTags(selectedTags);
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, selectedBlogId, selectedTags, onClose]);

  if (!open) return null;

  const toggleTag = (name) =>
    setDraftTags((prev) => (prev.includes(name) ? prev.filter((tag) => tag !== name) : [...prev, name]));

  const tabClass = (on) =>
    `h-9 flex-1 rounded-lg text-sm font-semibold ${on ? "bg-surface text-ink shadow-sm" : "text-ink-3"}`;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <section
        role="dialog"
        aria-label="필터"
        className="absolute inset-x-0 bottom-0 flex h-[85vh] flex-col rounded-t-2xl bg-surface"
      >
        <div className="flex h-5 shrink-0 items-center justify-center">
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>
        <div className="flex h-12 shrink-0 items-center pr-2 pl-5">
          <h2 className="flex-1 text-[17px] font-bold text-ink">필터</h2>
          <button
            type="button"
            onClick={() => {
              setDraftBlogId("");
              setDraftTags([]);
            }}
            className="h-11 px-3 text-sm font-semibold text-ink-3"
          >
            초기화
          </button>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-ink-2"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        <div role="tablist" aria-label="필터 종류" className="mx-5 mt-1 flex shrink-0 gap-1 rounded-xl bg-canvas p-1">
          <button type="button" role="tab" aria-selected={tab === "blog"} onClick={() => setTab("blog")} className={tabClass(tab === "blog")}>
            출처{draftBlogId ? " · 1" : ""}
          </button>
          <button type="button" role="tab" aria-selected={tab === "tag"} onClick={() => setTab("tag")} className={tabClass(tab === "tag")}>
            태그{draftTags.length ? ` · ${draftTags.length}` : ""}
          </button>
        </div>

        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          {tab === "blog" ? (
            <FilterList
              key="blog"
              items={blogFilters}
              selected={draftBlogId}
              onToggle={(id) => setDraftBlogId((prev) => (prev === id ? "" : id))}
              withIcon
              searchLabel="블로그 검색"
              rowClass="h-12"
            />
          ) : (
            <FilterList
              key="tag"
              items={tagFilters}
              selected={draftTags}
              onToggle={toggleTag}
              multiple
              searchLabel="태그 검색"
              rowClass="h-12"
            />
          )}
        </div>

        <div className="shrink-0 border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => onApply({ blogId: draftBlogId, tags: draftTags })}
            className="h-12 w-full rounded-xl bg-accent text-[15px] font-semibold text-accent-fg"
          >
            적용
          </button>
        </div>
      </section>
    </div>
  );
}

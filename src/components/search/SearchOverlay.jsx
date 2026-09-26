import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiChat3Line, RiCloseLine, RiFilter3Line, RiSearchLine } from "react-icons/ri";
import postsApi from "../../api/postsApi";
import { PATHS } from "../../routes/path";
import { useLoginGate } from "../../hooks/useLoginGate";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useSearchSuggestions } from "../../hooks/useSearchSuggestions";
import BlogIcon from "../common/BlogIcon";
import Highlight from "../common/Highlight";
import { searchTerms } from "../../utils/searchTerms";

const KBD = "rounded border border-line bg-surface px-1.5 py-px font-mono text-[11px] text-ink-3";

function GroupLabel({ children }) {
  return (
    <div className="flex h-7 items-end px-3 pb-1 text-[11px] font-semibold tracking-wide text-ink-3">
      {children}
    </div>
  );
}

/**
 * 검색 오버레이 — 데스크톱은 ⌘K 팔레트, 모바일은 전체 화면.
 * 블로그·주제 제안은 필터로, 글 제안은 결과로, 마지막 행은 챗봇으로 간다.
 */
export default function SearchOverlay({ initialQuery = "", onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const gate = useLoginGate();
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  // 입력창은 하나만 그린다 — 둘 다 그리면 ref·id 가 겹친다.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { blogs, topics, posts } = useSearchSuggestions(query);
  const trimmed = query.trim();
  const terms = searchTerms(trimmed);

  // 홈에서는 지금 필터(주제·출처)를 유지한 채 검색어만 바꾼다.
  const goHome = (updates) => {
    const params = new URLSearchParams(location.pathname === PATHS.HOME ? location.search : "");
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    });
    navigate({ pathname: PATHS.HOME, search: params.toString() });
    onClose();
  };

  const rows = useMemo(() => {
    const out = [];
    // 첫 행은 항상 '입력한 그대로 검색' — Enter 가 제안이 아니라 검색어로 간다.
    if (trimmed) {
      out.push({ key: "search", group: "검색", label: `‘${trimmed}’ 검색`, search: true, run: () => goHome({ q: trimmed }) });
    }
    blogs.forEach((blog) => out.push({ key: `b-${blog.id}`, group: "블로그", label: blog.name, blog, run: () => goHome({ blog: blog.id, q: null }) }));
    topics.forEach((topic) =>
      out.push({
        key: `t-${topic.kind}-${topic.id || topic.name}`,
        group: "주제",
        label: topic.name,
        topic,
        run: () => (topic.kind === "group" ? goHome({ group: topic.id, category: null, q: null }) : goHome({ category: topic.name, group: null, q: null })),
      })
    );
    posts.forEach((post) =>
      out.push({
        key: `p-${post.id}`,
        group: "글",
        label: post.title,
        post,
        run: () => {
          // 원문은 새 탭에서. 카드처럼 조회수를 올린다. 링크가 없으면 제목으로 검색.
          if (!post.link) return goHome({ q: post.title });
          postsApi.incrementViewCount(post.id);
          window.open(post.link, "_blank", "noopener");
          onClose();
          return undefined;
        },
      })
    );
    if (trimmed) {
      out.push({
        key: "chat",
        group: "챗봇",
        label: `‘${trimmed}’ 챗봇에 물어보기`,
        chat: true,
        run: () => {
          if (!gate()) return;
          navigate(`${PATHS.CHATBOT}?q=${encodeURIComponent(trimmed)}`);
          onClose();
        },
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogs, topics, posts, trimmed]);

  useEffect(() => {
    setActive(0);
  }, [rows.length, trimmed]);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submit = () => {
    if (rows[active]) rows[active].run();
    else if (trimmed) goHome({ q: trimmed });
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") onClose();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => Math.min(prev + 1, rows.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  const rowClass = (on) =>
    `flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] lg:h-10 lg:text-sm ${
      on ? "bg-canvas" : "hover:bg-canvas"
    }`;

  let lastGroup = "";
  const list = rows.map((row, index) => {
    const header = row.group !== lastGroup ? <GroupLabel key={`g-${row.group}`}>{row.group}</GroupLabel> : null;
    lastGroup = row.group;
    const on = index === active;
    let leading;
    let trailing = null;
    if (row.search) {
      leading = <RiSearchLine className="h-[18px] w-[18px] shrink-0 text-ink-3" />;
    } else if (row.blog) {
      leading = <BlogIcon blogId={row.blog.id} name={row.blog.name} size={22} />;
      trailing = <span className="font-mono text-[11px] text-ink-3">{row.blog.count}</span>;
    } else if (row.topic) {
      leading = <RiFilter3Line className="h-[18px] w-[18px] shrink-0 text-ink-3" />;
      trailing = row.topic.kind === "group" ? (
        <span className="text-[11px] text-ink-3">부모</span>
      ) : (
        <span className="font-mono text-[11px] text-ink-3">{row.topic.count}</span>
      );
    } else if (row.post) {
      leading = <BlogIcon blogId={row.post.blog_id} name={row.post.blog_name} size={22} />;
      trailing = <span className="shrink-0 text-[11px] text-ink-3">{row.post.blog_name}</span>;
    } else {
      leading = <RiChat3Line className="h-[18px] w-[18px] shrink-0 text-accent-ink" />;
    }
    return (
      <div key={row.key}>
        {header}
        <button
          type="button"
          role="option"
          aria-selected={on}
          onMouseEnter={() => setActive(index)}
          onClick={row.run}
          className={rowClass(on)}
        >
          {leading}
          <span className={`min-w-0 flex-1 truncate ${row.chat ? "font-semibold text-accent-ink" : row.search ? "font-semibold text-ink" : "font-medium text-ink"}`}>
            {row.chat || row.search ? row.label : <Highlight text={row.label} terms={terms} />}
          </span>
          {trailing}
          {on && <kbd className={`${KBD} hidden lg:inline`}>↵</kbd>}
        </button>
      </div>
    );
  });

  const input = (
    <>
      <label htmlFor="global-search" className="sr-only">
        검색
      </label>
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="검색"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
      />
    </>
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 hidden bg-black/45 lg:block" />

      {/* 모바일: 전체 화면 */}
      {!isDesktop && (
      <section role="dialog" aria-label="검색" className="absolute inset-0 flex flex-col bg-surface lg:hidden">
        <div className="flex h-14 shrink-0 items-center gap-1 border-b border-line pr-2 pl-4">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-accent bg-canvas px-3 text-ink-3">
            <RiSearchLine className="h-[18px] w-[18px] shrink-0" />
            {input}
            {query && (
              <button type="button" aria-label="지우기" onClick={() => setQuery("")} className="flex h-8 w-8 items-center justify-center text-ink-3">
                <RiCloseLine className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="h-11 px-2.5 text-sm font-semibold text-ink-2">
            취소
          </button>
        </div>
        <div role="listbox" className="flex-1 overflow-y-auto px-2 py-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {list}
        </div>
      </section>
      )}

      {/* 데스크톱: 팔레트 */}
      {isDesktop && (
      <section
        role="dialog"
        aria-label="검색"
        className="absolute left-1/2 top-[72px] hidden w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl lg:flex"
      >
        <div className="flex h-14 items-center gap-3 border-b border-line px-4 text-ink-3">
          <RiSearchLine className="h-5 w-5 shrink-0" />
          {input}
          <kbd className={KBD}>esc</kbd>
        </div>
        <div role="listbox" className="max-h-[min(32rem,calc(100vh-12rem))] overflow-y-auto px-2 py-1">
          {list}
        </div>
        <div className="flex h-10 items-center gap-4 border-t border-line px-4 text-xs text-ink-3">
          <span className="flex items-center gap-1">
            <kbd className={KBD}>↑</kbd>
            <kbd className={KBD}>↓</kbd> 이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className={KBD}>↵</kbd> 열기
          </span>
          <span className="flex items-center gap-1">
            <kbd className={KBD}>⌘K</kbd> 검색
          </span>
        </div>
      </section>
      )}
    </div>
  );
}

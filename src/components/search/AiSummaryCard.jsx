import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RiArrowDownSLine, RiArrowRightLine, RiCoinLine, RiRefreshLine, RiSparklingLine } from "react-icons/ri";
import { chatErrorMessage } from "../../api/chatApi";
import InsufficientCreditsModal from "../chatbot/InsufficientCreditsModal";
import { useAuth } from "../../hooks/useAuth";
import { useAiSummary } from "../../hooks/useAiSummary";
import { PATHS } from "../../routes/path";
import BlogIcon from "../common/BlogIcon";

const CLAMP_LINES = 6;
const SOURCE_LIMIT = 3;
const BTN_PRIMARY =
  "flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-accent-fg hover:opacity-90";
const BTN_TEXT = "flex h-8 items-center gap-1 px-1 text-[13px] font-semibold text-accent-ink hover:underline";

/** 본문의 `[n]` 을 n 번째 참고 글로 가는 링크로 바꾼다. 마크다운이 그대로 렌더한다. */
const linkCitations = (text) => text.replace(/\[(\d{1,2})\]/g, (match, n) => `[${n}](#src-${n})`);

/** 검색 결과 맨 위 — AI 요약. 요약 보기를 누르기 전엔 버튼 하나, 누르면 짧은 답변과 참고 글. */
export default function AiSummaryCard({ query, posts }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const postIds = useMemo(() => posts.slice(0, 8).map((post) => post.id), [posts]);
  const { state, result, error, run, stop, reset } = useAiSummary(query, postIds);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const bodyRef = useRef(null);

  // 접힌 높이보다 길 때만 '더 보기' 를 보인다.
  useEffect(() => {
    setExpanded(false);
    const el = bodyRef.current;
    if (!el || state !== "done") return;
    setOverflowing(el.scrollHeight > el.clientHeight + 2);
  }, [state, result]);

  const sources = useMemo(() => result?.sources || [], [result]);
  const components = useMemo(
    () => ({
      a: ({ href, children, ...props }) => {
        const cite = /^#src-(\d+)$/.exec(href || "");
        if (cite) {
          const source = sources[Number(cite[1]) - 1];
          const label = children;
          if (!source?.link) return <sup className="mx-px font-mono text-[10px] text-accent-ink">{label}</sup>;
          return (
            <sup className="mx-px">
              <a
                href={source.link}
                target="_blank"
                rel="noreferrer"
                title={source.title}
                className="rounded-[3px] bg-accent-soft px-1 font-mono text-[10px] font-semibold text-accent-ink no-underline hover:underline"
              >
                {label}
              </a>
            </sup>
          );
        }
        return (
          <a href={href} target="_blank" rel="noreferrer" className="text-accent-ink hover:underline" {...props}>
            {children}
          </a>
        );
      },
      p: ({ ...props }) => <p {...props} className="my-1.5 break-words [overflow-wrap:anywhere]" />,
      ul: ({ ...props }) => <ul {...props} className="my-1.5 list-disc pl-5" />,
      ol: ({ ...props }) => <ol {...props} className="my-1.5 list-decimal pl-5" />,
    }),
    [sources]
  );

  const title = (
    <span className="flex h-7 items-center gap-1.5">
      <RiSparklingLine className="h-[18px] w-[18px] text-accent-ink" />
      <span className="text-[15px] font-bold text-ink">AI 요약</span>
    </span>
  );

  const card = (children) => (
    <section
      aria-label="AI 요약"
      data-testid="ai-summary"
      className="mb-4 flex flex-col gap-2 rounded-xl bg-accent-soft/40 px-4 py-3 dark:bg-accent-soft/30"
    >
      {children}
    </section>
  );

  if (state === "idle") {
    return card(
      <div className="flex items-center gap-3">
        {title}
        <span className="flex-1" />
        {isAuthenticated ? (
          <button type="button" onClick={run} className={BTN_PRIMARY}>
            요약 보기
            <span className="flex items-center gap-0.5 opacity-90">
              <RiCoinLine className="h-4 w-4" />
              <span className="font-mono">1</span>
            </span>
          </button>
        ) : (
          <button type="button" onClick={run} className="h-9 rounded-lg border border-ink px-3.5 text-[13px] font-semibold text-ink hover:bg-canvas">
            로그인
          </button>
        )}
      </div>
    );
  }

  if (state === "loading") {
    return card(
      <>
        <div className="flex items-center gap-3">
          {title}
          <span className="flex-1" />
          <button type="button" onClick={stop} className="h-8 px-1 text-[13px] font-semibold text-ink-3 hover:text-ink">
            중지
          </button>
        </div>
        <div className="flex flex-col gap-2.5 py-1" aria-busy="true">
          <span className="skeleton h-3 w-[96%]" />
          <span className="skeleton h-3 w-[88%]" />
          <span className="skeleton h-3 w-[72%]" />
        </div>
      </>
    );
  }

  if (state === "nocredit") {
    return (
      <>
        {card(
          <div className="flex items-center gap-3">
            {title}
            <span className="flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <RiCoinLine className="h-3.5 w-3.5" />
              크레딧 (0)
            </span>
            <span className="flex-1" />
            <button type="button" onClick={reset} className="h-8 px-1 text-[13px] font-semibold text-ink-3 hover:text-ink">
              닫기
            </button>
          </div>
        )}
        <InsufficientCreditsModal isOpen onClose={reset} />
      </>
    );
  }

  if (state === "error") {
    return card(
      <div className="flex flex-wrap items-center gap-3">
        {title}
        <span className="text-[13px] text-rose-700 dark:text-rose-300">{chatErrorMessage(error)}</span>
        <span className="flex-1" />
        <button type="button" onClick={run} className={BTN_TEXT}>
          다시 시도
        </button>
      </div>
    );
  }

  const shown = sources.slice(0, SOURCE_LIMIT);
  const rest = sources.length - shown.length;
  return card(
    <>
      <div className="flex items-center gap-3">
        {title}
        <span className="flex-1" />
        <button
          type="button"
          onClick={run}
          aria-label="다시 만들기"
          title="다시 만들기"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface hover:text-ink"
        >
          <RiRefreshLine className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={bodyRef}
        className={`text-[15px] leading-relaxed text-ink ${expanded ? "" : "line-clamp-6"}`}
        style={expanded ? undefined : { WebkitLineClamp: CLAMP_LINES }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {linkCitations(result.answer)}
        </ReactMarkdown>
      </div>
      {overflowing && (
        <button type="button" onClick={() => setExpanded((prev) => !prev)} className={`${BTN_TEXT} w-fit`}>
          {expanded ? "접기" : "더 보기"}
          <RiArrowDownSLine className={`h-4 w-4 ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        {shown.map((source, index) => (
          <a
            key={`${source.link || source.title}-${index}`}
            href={source.link || "#"}
            target="_blank"
            rel="noreferrer"
            title={source.title}
            className="flex h-7 max-w-[200px] items-center gap-1.5 text-xs text-ink-2 hover:text-ink"
          >
            <BlogIcon blogId={source.blog_id} name={source.blog_name} size={16} />
            <span className="truncate">{source.title}</span>
          </a>
        ))}
        {rest > 0 && <span className="font-mono text-xs text-ink-3">+{rest}</span>}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() =>
            navigate(`${PATHS.CHATBOT}?session=${encodeURIComponent(result.sessionId)}&from=search&q=${encodeURIComponent(query)}`)
          }
          className={BTN_TEXT}
        >
          이어서 묻기
          <RiArrowRightLine className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

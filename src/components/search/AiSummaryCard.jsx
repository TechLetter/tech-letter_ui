import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RiArrowDownSLine, RiChat3Line, RiCoinLine, RiSparklingLine } from "react-icons/ri";
import { chatErrorMessage } from "../../api/chatApi";
import InsufficientCreditsModal from "../chatbot/InsufficientCreditsModal";
import { useAuth } from "../../hooks/useAuth";
import { useAiSummary } from "../../hooks/useAiSummary";
import { PATHS } from "../../routes/path";
import { displayName } from "../../utils/modelName";
import BlogIcon from "../common/BlogIcon";

const BTN_PRIMARY =
  "flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-accent-fg hover:opacity-90";
const BTN_GHOST =
  "flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink-2 hover:bg-canvas";

/** 검색 결과 맨 위 — AI 요약. 누르기 전엔 한 줄, 누르면 답변·참고한 글·이어서 묻기. */
export default function AiSummaryCard({ query, posts }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const postIds = useMemo(() => posts.slice(0, 8).map((post) => post.id), [posts]);
  const { state, result, error, run, stop, reset } = useAiSummary(query, postIds);
  const [collapsed, setCollapsed] = useState(false);
  // 모바일은 답변을 6줄로 접어 결과 카드가 바로 보이게 한다.
  const [answerOpen, setAnswerOpen] = useState(false);
  const remaining = user?.credits?.remaining;

  const head = (
    <span className="flex items-center gap-2 text-accent-ink">
      <RiSparklingLine className="h-[18px] w-[18px]" />
      <span className="text-[15px] font-bold text-ink">AI 요약</span>
    </span>
  );
  const creditChip = (
    <span className="flex items-center gap-1 text-xs text-ink-3">
      <RiCoinLine className="h-3.5 w-3.5" />
      크레딧 {typeof remaining === "number" && <span className="font-mono">({remaining})</span>}
    </span>
  );

  const box = (children, extra = "") => (
    <section
      aria-label="AI 요약"
      data-testid="ai-summary"
      className={`mb-4 flex flex-col gap-2.5 rounded-xl border border-accent bg-surface px-4 py-3 ${extra}`}
    >
      {children}
    </section>
  );

  if (state === "idle" || (state === "done" && collapsed)) {
    return box(
      <div className="flex items-center gap-3">
        {head}
        <span className="flex-1" />
        {state === "done" ? (
          <button type="button" onClick={() => setCollapsed(false)} className={BTN_GHOST}>
            펼치기
            <RiArrowDownSLine className="h-4 w-4" />
          </button>
        ) : isAuthenticated ? (
          <button type="button" onClick={run} className={BTN_PRIMARY}>
            만들기
            <RiCoinLine className="h-4 w-4" />
            <span className="font-mono">1</span>
          </button>
        ) : (
          <button type="button" onClick={run} className="h-9 rounded-lg border border-ink px-3.5 text-[13px] font-semibold text-ink hover:bg-canvas">
            로그인
          </button>
        )}
      </div>,
      "py-2.5"
    );
  }

  if (state === "nocredit") {
    return (
      <>
        {box(
          <div className="flex items-center gap-3">
            {head}
            <span className="flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <RiCoinLine className="h-3.5 w-3.5" />
              크레딧 (0)
            </span>
            <span className="flex-1" />
            <button type="button" onClick={reset} className={BTN_GHOST}>
              닫기
            </button>
          </div>,
          "py-2.5"
        )}
        <InsufficientCreditsModal isOpen onClose={reset} />
      </>
    );
  }

  if (state === "loading") {
    return box(
      <>
        <div className="flex items-center gap-3">
          {head}
          <span className="flex-1" />
          {creditChip}
        </div>
        <div className="flex flex-col gap-2.5 pt-1" aria-busy="true">
          <span className="h-3 w-[96%] rounded-md bg-canvas" />
          <span className="h-3 w-[88%] rounded-md bg-canvas" />
          <span className="h-3 w-[72%] rounded-md bg-canvas" />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-3">생성 중 · 참고한 글 ({postIds.length})</span>
          <span className="flex-1" />
          <button type="button" onClick={stop} className={BTN_GHOST}>
            중지
          </button>
        </div>
      </>
    );
  }

  if (state === "error") {
    return box(
      <div className="flex flex-wrap items-center gap-3">
        {head}
        <span className="text-sm text-rose-600 dark:text-rose-300">{chatErrorMessage(error)}</span>
        <span className="flex-1" />
        <button type="button" onClick={run} className={BTN_GHOST}>
          다시 시도
        </button>
      </div>,
      "py-2.5"
    );
  }

  const model = result.modelId ? displayName({ model_id: result.modelId }).name : "";
  return box(
    <>
      <div className="flex flex-wrap items-center gap-3">
        {head}
        {model && (
          <span className="flex h-6 items-center gap-1.5 rounded-full border border-line px-2 text-xs text-ink-2">
            <span className="h-[7px] w-[7px] rounded-full bg-emerald-500" />
            {model}
          </span>
        )}
        <span className="flex-1" />
        {creditChip}
      </div>
      <div
        className={`prose prose-sm prose-slate max-w-none text-[15px] leading-relaxed text-ink dark:prose-invert ${
          answerOpen ? "" : "line-clamp-6 lg:line-clamp-none"
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
      </div>
      <button
        type="button"
        onClick={() => setAnswerOpen((prev) => !prev)}
        className="flex h-8 w-fit items-center gap-1 text-[13px] font-semibold text-accent-ink lg:hidden"
      >
        {answerOpen ? "접기" : "더 보기"}
        <RiArrowDownSLine className={`h-4 w-4 ${answerOpen ? "rotate-180" : ""}`} />
      </button>
      {result.sources.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-3">참고한 글 ({result.sources.length})</span>
          <div className="flex flex-wrap gap-1.5">
            {result.sources.map((source, index) => (
              <a
                key={`${source.link || source.title}-${index}`}
                href={source.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex h-7 max-w-[240px] items-center gap-1.5 rounded-full border border-line bg-surface pr-2.5 pl-1 text-xs"
              >
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-accent-soft px-1 font-mono text-[11px] text-accent-ink">
                  {index + 1}
                </span>
                <BlogIcon blogId={source.blog_id} name={source.blog_name} size={16} />
                <span className="truncate text-ink-2">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() =>
            navigate(`${PATHS.CHATBOT}?session=${encodeURIComponent(result.sessionId)}&from=search&q=${encodeURIComponent(query)}`)
          }
          className={BTN_PRIMARY}
        >
          <RiChat3Line className="h-4 w-4" />
          이어서 묻기
        </button>
        <button type="button" onClick={run} className={BTN_GHOST}>
          다시 만들기
        </button>
        <span className="flex-1" />
        <button type="button" onClick={() => setCollapsed(true)} className="flex h-9 items-center gap-1 px-2 text-[13px] font-semibold text-ink-3 hover:text-ink">
          접기
          <RiArrowDownSLine className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigationType, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RiArrowDownSLine, RiExternalLinkLine, RiRefreshLine } from "react-icons/ri";
import { IoShareSocialOutline } from "react-icons/io5";
import { GrView } from "react-icons/gr";
import postsApi from "../../api/postsApi";
import { ApiError, ErrorCode } from "../../api/apiError";
import { PATHS, postDetailPath } from "../../routes/path";
import { showToast } from "../../provider/toastModalBridge";
import BlogIcon from "../../components/common/BlogIcon";
import BookmarkToggleButton from "../../components/bookmark/BookmarkToggleButton";
import timeutils from "../../utils/timeutils";

// 본문(body_md) 렌더링. 긴 글 기준(16~17px/1.8배 행간)으로 맞췄고, 원문 인용을
// 시각적으로 구분하는 blockquote를 더했다. `node`는 react-markdown이 각 컴포넌트에
// 넘기는 AST 노드 — 스프레드로 DOM에 새지 않게 분해해서 받는다.
const MD_COMPONENTS = {
  h2: ({ node, ...props }) => (
    <h2
      {...props}
      id={`s-${node.position.start.line}`}
      className="mt-10 mb-3 scroll-mt-[calc(var(--tl-header-h)+1rem)] text-lg font-bold text-ink sm:text-xl"
    />
  ),
  h3: ({ node, ...props }) => <h3 {...props} className="mt-6 mb-2 text-base font-bold text-ink" />,
  p: ({ node, ...props }) => (
    <p {...props} className="my-4 text-[16px] leading-[1.8] text-ink-2 [overflow-wrap:anywhere] sm:text-[17px] sm:break-keep" />
  ),
  ul: ({ node, ...props }) => <ul {...props} className="my-3 list-disc space-y-1 pl-5 text-ink-2" />,
  ol: ({ node, ...props }) => <ol {...props} className="my-4 list-decimal space-y-1.5 pl-5 text-ink-2" />,
  // bullet은 2~3줄 문장이라 문단(1.8)보다 촘촘하게 둔다.
  li: ({ node, ...props }) => <li {...props} className="text-[16px] leading-[1.65] sm:text-[17px]" />,
  strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-ink" />,
  blockquote: ({ node, ...props }) => (
    // italic은 지웠다 — index.css가 font-synthesis:none이고 본문 서체(IBM Plex Sans KR)엔
    // 이탤릭이 없어 어차피 적용되지 않는다.
    <blockquote
      {...props}
      className="my-5 rounded-r-lg border-l-[3px] border-accent/50 bg-canvas py-2.5 pl-4 pr-3 text-ink-2"
    />
  ),
  code: ({ node, className, children, ...props }) => (
    <code {...props} className={`${className || ""} rounded bg-canvas px-1 py-0.5 break-words`}>
      {children}
    </code>
  ),
  // 코드 블록(pre > code)은 pre가 이미 배경을 깔아 준다 — 안쪽 code의 배경·패딩은 초기화.
  pre: ({ node, ...props }) => (
    <pre {...props} className="my-4 max-w-full overflow-x-auto rounded-lg bg-canvas p-3 text-sm [&>code]:bg-transparent [&>code]:p-0" />
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className="text-accent-ink underline decoration-accent-ink/40 underline-offset-2 hover:decoration-accent-ink"
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-4 max-w-full overflow-x-auto">
      <table {...props} className="w-full min-w-max text-sm" />
    </div>
  ),
  th: ({ node, ...props }) => <th {...props} className="border border-line px-2 py-1 text-left" />,
  td: ({ node, ...props }) => <td {...props} className="border border-line px-2 py-1" />,
};

// 목차 최소 섹션 수. 이보다 적으면 스크롤만으로 충분해 레일을 그리지 않는다.
const TOC_MIN_SECTIONS = 4;

/** 메타 줄 가운데 점 구분자. 장식이라 스크린리더엔 읽히지 않게 한다. */
function Dot() {
  return (
    <span aria-hidden="true" className="text-line">
      ·
    </span>
  );
}

/** 제목 끝에 붙는 원문 아이콘. 텍스트 버튼 대신 아이콘만 두고 새 탭으로 연다. 출처 표시는
 *  제목 위의 블로그 아이콘·이름이 맡는다. */
function OriginalIconLink({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="원문 (새 탭)"
      title="원문"
      // 크기·정렬을 제목 글자 크기(em) 기준으로 둔다 — 모바일 20px·데스크톱 24px 모두 글자 중심에 맞는다.
      className="ml-1 inline-flex size-[1.3em] items-center justify-center rounded-full align-baseline text-ink-3 hover:bg-canvas hover:text-ink"
    >
      <RiExternalLinkLine size="0.75em" aria-hidden="true" />
    </a>
  );
}

/** 마지막 단어와 아이콘을 한 덩어리로 묶어, 아이콘만 다음 줄로 떨어지지 않게 한다. */
function TitleWithIcon({ title, href }) {
  const cut = title.lastIndexOf(" ");
  const head = cut >= 0 ? title.slice(0, cut + 1) : "";
  const last = cut >= 0 ? title.slice(cut + 1) : title;
  return (
    <>
      {head}
      <span className="whitespace-nowrap">
        {last}
        <OriginalIconLink href={href} />
      </span>
    </>
  );
}

function TldrSkeleton() {
  return (
    <section aria-busy="true" className="mt-5 flex flex-col gap-2.5 border-b border-line pb-5">
      <span className="skeleton h-5 w-[85%]" />
      <span className="skeleton h-4 w-full" />
      <span className="skeleton h-4 w-[70%]" />
    </section>
  );
}

/** body_md의 `## ` 줄에서 목차를 뽑는다. id는 MD_COMPONENTS의 h2와 같은 줄 번호 규칙(`s-{line}`)을 쓴다. */
function useTocSections(bodyMd) {
  return useMemo(() => {
    if (!bodyMd) return [];
    return bodyMd
      .split("\n")
      .flatMap((line, index) => (line.startsWith("## ") ? [{ id: `s-${index + 1}`, text: line.slice(3).trim() }] : []));
  }, [bodyMd]);
}

export default function PostDetail() {
  const { id } = useParams();
  const navType = useNavigationType();
  const titleRef = useRef(null);

  // loading | ready | missing(404) | error(그 외)
  const [post, setPost] = useState(null);
  const [postState, setPostState] = useState("loading");
  const [postRetry, setPostRetry] = useState(0);

  // loading | ready | none(404 — 아직 생성 안 됨) | error(그 외)
  const [explainer, setExplainer] = useState(null);
  const [explainerState, setExplainerState] = useState("loading");
  const [explainerRetry, setExplainerRetry] = useState(0);

  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const viewedRef = useRef(null);

  // 상세→상세(관련 글·태그) 이동이 생기면 의미가 커진다. 뒤로가기(POP) 복귀는 기존 스크롤
  // 위치가 의미 있을 수 있어(목차 앵커 등) 강제로 맨 위로 올리지 않는다.
  useEffect(() => {
    if (navType !== "POP") window.scrollTo(0, 0);
  }, [id, navType]);

  useEffect(() => {
    let ignore = false;
    setPost(null);
    setPostState("loading");
    postsApi
      .getPost(id)
      .then((res) => {
        if (!ignore) {
          setPost(res.data);
          setPostState("ready");
        }
      })
      .catch((err) => {
        if (ignore) return;
        const notFound = err instanceof ApiError && err.is(ErrorCode.RESOURCE_NOT_FOUND);
        setPostState(notFound ? "missing" : "error");
      });
    return () => {
      ignore = true;
    };
  }, [id, postRetry]);

  useEffect(() => {
    let ignore = false;
    setExplainer(null);
    setExplainerState("loading");
    postsApi
      .getExplainer(id)
      .then((res) => {
        if (!ignore) {
          setExplainer(res.data);
          setExplainerState("ready");
        }
      })
      .catch((err) => {
        if (ignore) return;
        const notFound = err instanceof ApiError && err.is(ErrorCode.RESOURCE_NOT_FOUND);
        setExplainerState(notFound ? "none" : "error");
      });
    return () => {
      ignore = true;
    };
  }, [id, explainerRetry]);

  // 조회수는 상세 페이지 진입 시 한 번만 올린다(카드·검색·트렌드에서는 올리지 않는다).
  useEffect(() => {
    if (!post || viewedRef.current === post.id) return;
    viewedRef.current = post.id;
    postsApi.incrementViewCount(post.id).catch(() => {});
  }, [post]);

  // 검색엔진 제외. 떠나면 원복한다.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    meta.setAttribute("content", "noindex, nofollow");
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // 문서 제목 + 포커스 이동. 글이 바뀔 때(= 새 post) 한 번만 — 해설 로딩·재시도로는 다시
  // 안 옮긴다(읽던 위치를 빼앗지 않도록).
  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = `${post.title} · Tech Letter`;
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      document.title = prevTitle;
    };
  }, [post]);

  // 용어 접힘은 글이 바뀌면 초기화 — 이전 글에서 펼쳐 둔 상태가 새 글로 이어지지 않게.
  useEffect(() => {
    setGlossaryOpen(false);
  }, [id]);

  const sections = useTocSections(explainer?.body_md);
  const showToc = sections.length >= TOC_MIN_SECTIONS;

  const [activeSectionId, setActiveSectionId] = useState(null);
  useEffect(() => {
    if (!showToc) return;
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tl-header-h"), 10) || 64;
    // 헤더 바로 아래를 지나간 마지막 제목이 현재 섹션이다. IntersectionObserver는 상태가 바뀐
    // 제목만 알려 줘서 빠르게 스크롤하면 엉뚱한 섹션이 남았다 — 스크롤마다 직접 계산한다.
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= headerH + 24) current = section.id;
      }
      setActiveSectionId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections, showToc]);

  // 목차 클릭은 라우터를 거치지 않고 history.replaceState만 쓴다 — 이력을 쌓지 않고,
  // 위 scrollTo(0,0)-on-POP 판단에 쓰는 navigationType도 건드리지 않는다.
  const handleTocClick = (event, sectionId) => {
    event.preventDefault();
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSectionId(sectionId);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${postDetailPath(post.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 — 조용히 무시.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL이 클립보드에 복사되었습니다.");
    } catch {
      showToast("복사하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (postState === "missing") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-ink-3">글을 찾을 수 없습니다.</p>
        <Link to={PATHS.HOME} className="text-sm font-semibold text-accent-ink hover:underline">
          홈으로
        </Link>
      </div>
    );
  }

  if (postState === "error") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-ink-3">글을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => setPostRetry((prev) => prev + 1)}
          className="text-sm font-semibold text-accent-ink hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (postState === "loading" || !post) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-3 py-2">
        <span className="skeleton block h-4 w-40" />
        <span className="skeleton block h-7 w-full" />
        <span className="skeleton block h-24 w-full rounded-xl" />
      </div>
    );
  }

  const hasExplainer = explainerState === "ready" && explainer;
  const hasGlossary = Boolean(hasExplainer && explainer.glossary?.length > 0);
  const hasRail = Boolean(hasExplainer && (showToc || hasGlossary));

  return (
    // 사이트 공통 본문 폭(MainLayout 1360px)을 그대로 쓴다. xl 이상에서 목차·용어가 있으면 오른쪽 레일을 둔다.
    <div
      className={`w-full ${hasRail ? "xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start xl:gap-10" : ""}`}
    >
      {/* 모바일은 헤더와 이어지는 전면 시트, sm 이상은 둥근 카드 — 회색 바탕(bg-canvas) 위에서는
          인용·코드 블록의 채움(역시 bg-canvas)이 묻혀 안 보였다. */}
      <div className="-mx-4 -mt-4 bg-surface px-4 pt-5 pb-8 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:border sm:border-line sm:px-8 sm:py-7 lg:px-10 lg:py-9">
        {/* 한 줄이 너무 길면 읽기 힘들어 글 폭은 56rem까지만. 왼쪽에 붙여 헤더 선과 맞춘다. */}
        <article className="max-w-[56rem]">
          <div className="flex min-w-0 items-center gap-2">
            <BlogIcon blogId={post.blog_id} name={post.blog_name} size={20} />
            <span className="min-w-0 truncate text-sm font-semibold text-ink-2">{post.blog_name}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-3">
            <span className="font-mono">{timeutils.formatLocalDate(post.published_at)}</span>
            {hasExplainer && (
              <>
                <Dot />
                <span className="font-mono">{explainer.reading_minutes} min</span>
              </>
            )}
            <Dot />
            <span className="flex items-center gap-1 font-mono">
              <GrView size={13} aria-hidden="true" />
              {post.view_count}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-1">
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="flex-1 text-xl leading-snug font-bold tracking-tight text-ink outline-none sm:text-2xl"
            >
              <TitleWithIcon title={post.title} href={post.link} />
            </h1>
            <button
              type="button"
              aria-label="공유"
              onClick={handleShare}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
            >
              <IoShareSocialOutline size={18} />
            </button>
            <BookmarkToggleButton postId={post.id} initialIsBookmarked={post.is_bookmarked} />
          </div>

          {explainerState === "loading" && <TldrSkeleton />}

          {explainerState !== "loading" && (
            <section aria-label="요약" className="mt-5 border-b border-line pb-5">
              {hasExplainer ? (
                // 한 줄 요약은 카드에서 이미 봤고 본문 개요와도 겹친다 — 상세에서는 핵심 3줄만 둔다.
                explainer.points?.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-[16px] leading-[1.65] font-medium text-ink marker:text-accent sm:text-[17px]">
                    {explainer.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[17px] leading-relaxed font-bold text-ink sm:text-lg">{explainer.one_liner}</p>
                )
              ) : (
                <div className="flex items-start justify-between gap-3">
                  {post.summary && <p className="text-[15px] leading-relaxed text-ink-2">{post.summary}</p>}
                  {explainerState === "error" && (
                    <button
                      type="button"
                      aria-label="해설 다시 시도"
                      onClick={() => setExplainerRetry((prev) => prev + 1)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
                    >
                      <RiRefreshLine className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 해설 로딩 중 본문 자리에도 스켈레톤을 둔다 — CTA가 로딩 끝나자마자 8,000자
              아래로 뚝 떨어지는(점프) 걸 막는다. CTA 자체는 로딩이 끝난 뒤에만 그린다. */}
          {explainerState === "loading" && (
            <div className="mt-6 space-y-3" aria-hidden="true">
              {[92, 100, 85, 60].map((width, index) => (
                <span key={index} className="skeleton block h-4" style={{ width: `${width}%` }} />
              ))}
            </div>
          )}

          {hasExplainer && (
            <div className="mt-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {explainer.body_md}
              </ReactMarkdown>
            </div>
          )}

          {hasExplainer && explainer.glossary?.length > 0 && (
            <section className={`mt-6 overflow-hidden rounded-xl border border-line bg-surface ${hasRail ? "xl:hidden" : ""}`}>
              <button
                type="button"
                onClick={() => setGlossaryOpen((prev) => !prev)}
                aria-expanded={glossaryOpen}
                aria-controls="glossary-panel"
                className="flex h-12 w-full items-center justify-between px-4 text-left text-sm font-semibold text-ink"
              >
                <span>
                  용어 <span className="font-mono text-ink-3">({explainer.glossary.length})</span>
                </span>
                <RiArrowDownSLine className={`h-4 w-4 text-ink-3 transition-transform ${glossaryOpen ? "rotate-180" : ""}`} />
              </button>
              <dl id="glossary-panel" hidden={!glossaryOpen} className="space-y-3 border-t border-line px-4 py-4">
                {explainer.glossary.map((item, index) => (
                  <div key={index}>
                    <dt className="text-sm font-semibold text-ink">
                      {item.term}
                      {item.original && <span className="ml-1.5 font-normal text-ink-3">({item.original})</span>}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-ink-2">{item.explanation}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* 글이 끝난 뒤 다음 행동. 관련 글 백엔드가 없는 지금은 태그 → 홈 검색이 가장 싼 경로. */}
          {post.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`${PATHS.HOME}?q=${encodeURIComponent(tag)}`}
                  className="rounded-md bg-canvas px-2 py-[3px] text-xs text-ink-2 hover:text-accent-ink"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

        </article>
      </div>

      {hasRail && (
        <aside
          aria-label="목차"
          className="hidden xl:sticky xl:top-[calc(var(--tl-header-h)+1.5rem)] xl:block xl:max-h-[calc(100dvh-var(--tl-header-h)-3rem)] xl:self-start xl:overflow-y-auto"
        >
          {showToc && <nav className="mb-6">
            <ol className="border-l border-line text-[13px]">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={activeSectionId === section.id ? "location" : undefined}
                    onClick={(event) => handleTocClick(event, section.id)}
                    className={`-ml-px block border-l-2 py-1.5 pl-3 leading-snug ${
                      activeSectionId === section.id
                        ? "border-accent font-semibold text-ink"
                        : "border-transparent text-ink-3 hover:text-ink"
                    }`}
                  >
                    {section.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>}
          {hasGlossary && (
            <dl className="space-y-2 text-[13px]">
              {explainer.glossary.map((item, index) => (
                <div key={index}>
                  <dt className="font-semibold text-ink">
                    {item.term}
                    {item.original && <span className="ml-1 font-normal text-ink-3">({item.original})</span>}
                  </dt>
                  <dd className="text-ink-2 leading-snug">{item.explanation}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>
      )}
    </div>
  );
}

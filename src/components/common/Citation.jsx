/**
 * 답변 본문의 `[n]` 을 n 번째 참고 글 링크로 그린다. 검색 AI 요약과 챗봇 답변이 함께 쓴다.
 * 번호는 `sources` 순서와 같다(서버가 글 단위로 매긴다). 본문 변환은 `utils/citations.js`.
 */

/** ReactMarkdown `components.a` — 인용이면 출처 링크, 아니면 일반 외부 링크. */
export function CitationAnchor({ href, children, sources = [], className = "text-accent-ink hover:underline", ...props }) {
  const cite = /^#src-(\d+)$/.exec(href || "");
  if (!cite) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  }
  const source = sources[Number(cite[1]) - 1];
  if (!source?.link) return <sup className="mx-px font-mono text-[10px] text-accent-ink">{children}</sup>;
  return (
    <sup className="mx-px">
      <a
        href={source.link}
        target="_blank"
        rel="noreferrer"
        title={source.title}
        className="rounded-[3px] bg-accent-soft px-1 font-mono text-[10px] font-semibold text-accent-ink no-underline hover:underline"
      >
        {children}
      </a>
    </sup>
  );
}

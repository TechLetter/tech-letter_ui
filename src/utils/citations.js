/** 답변 본문의 `[n]` → 마크다운 링크 `[n](#src-n)`. `CitationAnchor` 가 n 번째 출처로 바꾼다. */
export const linkCitations = (text) =>
  (text || "").replace(/\[(\d{1,2})\](?!\()/g, (match, n) => `[${n}](#src-${n})`);

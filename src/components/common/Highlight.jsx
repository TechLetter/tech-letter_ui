const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isLatin = (term) => /^[A-Za-z0-9]+$/.test(term);

/**
 * 본문 안의 검색어를 `<mark>` 로 감싼다. 검색어가 없으면 그대로.
 * 영문·숫자 검색어는 단어 시작에서만(‘ai’ 가 Training 의 ai 를 칠하지 않게), 한글은 부분 일치.
 */
export default function Highlight({ text = "", terms = [] }) {
  const clean = terms.filter(Boolean);
  if (!text || clean.length === 0) return text;
  const lowered = new Set(clean.map((term) => term.toLowerCase()));
  const pattern = new RegExp(
    `(${clean.map((term) => (isLatin(term) ? `(?<![A-Za-z0-9])${escapeRegExp(term)}` : escapeRegExp(term))).join("|")})`,
    "gi"
  );
  return text.split(pattern).map((part, index) =>
    part && lowered.has(part.toLowerCase()) ? (
      <mark key={index} className="rounded-[3px] bg-accent-soft px-0.5 text-accent-ink">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

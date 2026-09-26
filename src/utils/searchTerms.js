/** 검색어를 공백으로 나눈 조각. 하이라이트와 제안 매칭이 같은 규칙을 쓴다. */
export const searchTerms = (query = "") =>
  query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

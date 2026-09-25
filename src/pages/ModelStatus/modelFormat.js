/** 컨텍스트 길이. 262144 → 262K, 1048576 → 1M. */
export function formatContext(tokens) {
  if (!tokens) return null;
  if (tokens >= 1_000_000) return `${Math.round(tokens / 1_000_000)}M`;
  return `${Math.round(tokens / 1000)}K`;
}

/** 출시 월. "2026-06-04T…" → 2026.06 */
export function formatMonth(iso) {
  return iso ? iso.slice(0, 7).replace("-", ".") : null;
}

/** 설명 속 마크다운 링크는 글자만 남긴다. */
export function plainDescription(text = "") {
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

/** 평균 응답 시간. 정량 지표라 단위는 영어로 쓴다(850ms, 1.2s, 27s). */
export function formatLatency(latencyMs) {
  if (latencyMs == null) return null;
  if (latencyMs < 1000) return `${Math.round(latencyMs)}ms`;
  if (latencyMs < 10000) return `${(latencyMs / 1000).toFixed(1)}s`;
  return `${Math.round(latencyMs / 1000)}s`;
}

/** 상태 점 툴팁의 덧붙임. 불안정은 24시간 가용률, 사용 불가는 실패 사유. */
export function statusDetail(model) {
  if (model.state === "degraded") return `24h ${model.uptime_24h}%`;
  if (model.state === "down") return reasonLabel(model.latest_status);
  return "";
}

/** 헬스체크의 최근 실패 상태 코드를 사람이 읽는 말로. */
export function reasonLabel(latestStatus = "") {
  const status = String(latestStatus);
  if (/429/.test(status)) return "요청 한도 초과";
  if (/40[13]/.test(status)) return "접근 불가";
  if (/404/.test(status)) return "제공 중단";
  if (/timeout|timed out/i.test(status)) return "응답 없음";
  if (/5\d\d/.test(status)) return "제공사 서버 오류";
  return "응답 오류";
}

/** 오늘(UTC)까지 거꾸로 `days`일의 YYYY-MM-DD. API의 일별 집계가 UTC 날짜를 쓴다. */
export function lastDays(days, now = new Date()) {
  const out = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

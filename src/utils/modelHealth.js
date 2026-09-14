/**
 * 모델 헬스 상태를 판정 · 정렬하는 곳. 챗봇 모델 선택창과 어드민 모델
 * 선호목록 편집창이 같은 기준을 써야 "이 모델 지금 괜찮나"가 화면마다
 * 다르게 보이지 않는다.
 *
 * 상태 4단계: healthy(정상) > degraded(불안정, 429) > down(장애) > unknown(정보 없음).
 */

export const HEALTH_LEVEL = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  DOWN: "down",
  UNKNOWN: "unknown",
};

const LEVEL_RANK = {
  [HEALTH_LEVEL.HEALTHY]: 0,
  [HEALTH_LEVEL.DEGRADED]: 1,
  [HEALTH_LEVEL.DOWN]: 2,
  [HEALTH_LEVEL.UNKNOWN]: 3,
};

/** LED 점 색상. Badge.jsx의 success/warning/error/neutral과 같은 팔레트를 쓴다. */
export const HEALTH_DOT_CLASS = {
  [HEALTH_LEVEL.HEALTHY]: "bg-emerald-500",
  [HEALTH_LEVEL.DEGRADED]: "bg-amber-500",
  [HEALTH_LEVEL.DOWN]: "bg-red-500",
  [HEALTH_LEVEL.UNKNOWN]: "bg-slate-300 dark:bg-slate-600",
};

export const HEALTH_LABEL = {
  [HEALTH_LEVEL.HEALTHY]: "정상",
  [HEALTH_LEVEL.DEGRADED]: "응답 지연 중",
  [HEALTH_LEVEL.DOWN]: "응답 없음",
  [HEALTH_LEVEL.UNKNOWN]: "상태 확인 필요",
};

/**
 * 공개 헬스 API 응답 한 건(`{latest_status, consecutive_failures, ...}`)을 보고
 * 4단계 중 하나로 분류한다.
 */
export function classifyModelHealth(health) {
  const status =
    typeof health?.latest_status === "string" ? health.latest_status.trim().toUpperCase() : "";
  const failures =
    typeof health?.consecutive_failures === "number" ? health.consecutive_failures : null;

  if (!status || failures === null) return HEALTH_LEVEL.UNKNOWN;
  if (status === "OK" && failures === 0) return HEALTH_LEVEL.HEALTHY;
  if (status === "429") return HEALTH_LEVEL.DEGRADED;
  return HEALTH_LEVEL.DOWN;
}

/**
 * 헬스 응답 배열을 "정상 우선 → uptime 높은 순 → 지연 낮은 순"으로 정렬한다.
 * 원본 배열은 건드리지 않는다.
 */
export function sortModelsByHealth(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const rankDiff = LEVEL_RANK[classifyModelHealth(a)] - LEVEL_RANK[classifyModelHealth(b)];
    if (rankDiff !== 0) return rankDiff;

    const uptimeDiff = (b?.uptime_24h ?? 0) - (a?.uptime_24h ?? 0);
    if (uptimeDiff !== 0) return uptimeDiff;

    const latencyA = a?.avg_latency_ms ?? Number.POSITIVE_INFINITY;
    const latencyB = b?.avg_latency_ms ?? Number.POSITIVE_INFINITY;
    return latencyA - latencyB;
  });
}

/** 목록 옆에 보여줄 보조 문구. "99.8% · 0.9s" 처럼. 정보가 없으면 빈 문자열. */
export function formatModelMeta(health) {
  const parts = [];
  if (typeof health?.uptime_24h === "number") {
    parts.push(`${health.uptime_24h.toFixed(1)}%`);
  }
  if (typeof health?.avg_latency_ms === "number") {
    parts.push(`${(health.avg_latency_ms / 1000).toFixed(1)}s`);
  }
  return parts.join(" · ");
}

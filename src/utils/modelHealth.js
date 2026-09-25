/**
 * 모델 상태 표시 · 정렬. 판정은 백엔드가 한다(`state`, model_scan.classify_state) —
 * 모델 페이지·챗봇 선택창·어드민이 같은 색을 보여야 해서 여기서 다시 판정하지 않는다.
 *
 * 상태: healthy(정상) > degraded(불안정 — 지금은 응답) > down(사용 불가 — 지금 실패)
 * > unknown(정보 없음). 챗봇에서는 healthy·degraded만 고를 수 있다.
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
  [HEALTH_LEVEL.DOWN]: "bg-slate-300 dark:bg-slate-600",
  [HEALTH_LEVEL.UNKNOWN]: "bg-slate-200 dark:bg-slate-700",
};

export const HEALTH_LABEL = {
  [HEALTH_LEVEL.HEALTHY]: "정상",
  [HEALTH_LEVEL.DEGRADED]: "불안정",
  [HEALTH_LEVEL.DOWN]: "사용 불가",
  [HEALTH_LEVEL.UNKNOWN]: "상태 확인 필요",
};

const LEVELS = new Set(Object.values(HEALTH_LEVEL));

/** 공개 모델 목록 한 건의 `state`. 없거나 모르는 값이면 unknown. */
export function classifyModelHealth(health) {
  return LEVELS.has(health?.state) ? health.state : HEALTH_LEVEL.UNKNOWN;
}

/** 챗봇에서 고를 수 있는가 — 지금 응답하는 모델(초록·주황)만. */
export function isSelectableModel(health) {
  const level = classifyModelHealth(health);
  return level === HEALTH_LEVEL.HEALTHY || level === HEALTH_LEVEL.DEGRADED;
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

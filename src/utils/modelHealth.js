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
 * 모델 순서. 서버가 요약·챗봇 자동 선택에 쓰는 추천 순위(`recommended_rank`, 성능 × 가용성 ×
 * 속도)를 그대로 따른다 — 챗봇 선택창 맨 위가 자동으로 고르는 모델이다. 순위가 없는(지금
 * 응답하지 않는) 모델은 뒤에 상태 → 가용률 순으로. 원본 배열은 건드리지 않는다.
 */
export function sortModelsByHealth(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const rankA = a?.recommended_rank;
    const rankB = b?.recommended_rank;
    if ((rankA == null) !== (rankB == null)) return rankA == null ? 1 : -1;
    if (rankA != null && rankA !== rankB) return rankA - rankB;

    const levelDiff = LEVEL_RANK[classifyModelHealth(a)] - LEVEL_RANK[classifyModelHealth(b)];
    if (levelDiff !== 0) return levelDiff;
    return (b?.uptime_24h ?? 0) - (a?.uptime_24h ?? 0);
  });
}

/** 모델 페이지의 검색·상태 탭·정렬. 모델이 20개 남짓이라 전부 클라이언트에서 한다. */

const STATE_ORDER = { healthy: 0, degraded: 1, down: 2 };

export const STATE_TABS = [
  ["all", "전체"],
  ["healthy", "정상"],
  ["degraded", "불안정"],
  ["down", "사용 불가"],
];

/** 기본 정렬. 지금 쓸 수 있는 것부터, 같은 상태면 30일 가용률 순. */
function byUsefulness(a, b) {
  return (
    (STATE_ORDER[a.state] ?? 3) - (STATE_ORDER[b.state] ?? 3) ||
    (b.uptime_30d ?? -1) - (a.uptime_30d ?? -1) ||
    a.model_id.localeCompare(b.model_id)
  );
}

const createdAt = (m) => (m.info?.created_at ? Date.parse(m.info.created_at) : null);

/** 카드에 늘 보이는 벤치마크(Artificial Analysis). 점수순 정렬도 이 지표를 따른다. */
export const METRICS = [
  { id: "intelligence", label: "Intelligence" },
  { id: "coding", label: "Coding" },
  { id: "agentic", label: "Agentic" },
];

export function metricOf(id) {
  const found = METRICS.find((m) => m.id === id) || METRICS[0];
  return { ...found, key: (model) => model.info?.benchmarks?.[found.id] };
}

/** 순서만 정한다. `key`가 없는 모델(사용 불가의 응답 시간 등)은 항상 뒤로. */
export const SORTS = {
  score: { label: "점수순" },
  uptime: { label: "가용률", title: "30일 가용률" },
  latency: { label: "응답 시간", key: (m) => (m.state === "down" ? null : m.avg_latency_ms), dir: 1 },
  context: { label: "컨텍스트", key: (m) => m.info?.context_length, dir: -1 },
  newest: { label: "최신", key: createdAt, dir: -1 },
};

/**
 * 점수순도 "지금 쓸 수 있는가"가 먼저다. 쓸 수 있는 모델(점수순 → 점수 없음) 다음에
 * 사용 불가 모델(같은 규칙). 요약·챗봇이 모델을 고르는 순서(`scouter.rank_models`)와 같다.
 */
function byScore(key) {
  return (a, b) => {
    const x = key(a);
    const y = key(b);
    return (
      (a.state === "down") - (b.state === "down") ||
      (x == null) - (y == null) ||
      (x != null && y != null ? y - x : 0) ||
      byUsefulness(a, b)
    );
  };
}

export function sortModels(models, sort, metric) {
  if (!SORTS[sort] || sort === "score") return [...models].sort(byScore(metric.key));
  const { key, dir } = SORTS[sort];
  if (!key) return [...models].sort(byUsefulness);
  return [...models].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x == null || y == null) return (x == null) - (y == null) || byUsefulness(a, b);
    return (x - y) * dir || byUsefulness(a, b);
  });
}

export function matchesQuery(model, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${model.info?.name || ""} ${model.model_id}`.toLowerCase().includes(q);
}

export function countByState(models) {
  const counts = { all: models.length, healthy: 0, degraded: 0, down: 0 };
  for (const model of models) if (model.state in counts) counts[model.state] += 1;
  return counts;
}

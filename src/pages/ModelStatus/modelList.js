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

/** `key`가 없는 모델(벤치마크 없음, 사용 불가의 응답 시간)은 항상 뒤로 보낸다. */
export const SORTS = {
  uptime: { label: "가용률 30d" },
  latency: { label: "응답 시간", key: (m) => (m.state === "down" ? null : m.avg_latency_ms), dir: 1 },
  context: { label: "컨텍스트", key: (m) => m.info?.context_length, dir: -1 },
  intelligence: { label: "Intelligence", key: (m) => m.info?.benchmarks?.intelligence, dir: -1 },
  newest: { label: "최신", key: createdAt, dir: -1 },
};

export function sortModels(models, sort) {
  const { key, dir } = SORTS[sort] || SORTS.uptime;
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

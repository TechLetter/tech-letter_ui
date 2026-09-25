/** "nvidia/nemotron-3.5-lightning:free" → { provider: "nvidia", name: "nemotron-3.5-lightning" } */
export function splitModelId(modelId = "") {
  const [provider, ...rest] = modelId.split("/");
  const name = (rest.join("/") || provider).replace(/:free$/, "");
  return { provider: rest.length ? provider : "", name };
}

/** 평균 응답 시간 등급. 실측 분포(0.7~27초)에서 나눈 기준이다. */
export function speedGrade(latencyMs) {
  if (latencyMs == null) return null;
  if (latencyMs < 1500) return { label: "빠름", tone: "fast" };
  if (latencyMs < 5000) return { label: "보통", tone: "normal" };
  return { label: "느림", tone: "slow" };
}

/** 헬스체크의 최근 상태 코드를 사람이 읽는 말로. */
export function reasonLabel(latestStatus = "") {
  const status = String(latestStatus);
  if (status === "OK") return "응답 불안정";
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

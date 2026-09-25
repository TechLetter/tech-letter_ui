/** 모델 표시 이름. 모델 페이지·챗봇 선택창·어드민이 같은 이름을 보여야 한다. */

/** "nvidia/nemotron-3.5-lightning:free" → { provider: "nvidia", name: "nemotron-3.5-lightning" } */
export function splitModelId(modelId = "") {
  const [provider, ...rest] = modelId.split("/");
  const name = (rest.join("/") || provider).replace(/:free$/, "");
  return { provider: rest.length ? provider : "", name };
}

/** OpenRouter 공식 이름("NVIDIA: Nemotron 3 Ultra")을 나눈다. 아직 없으면 id로. */
export function displayName(model) {
  const official = model.info?.name;
  if (!official) return splitModelId(model.model_id);
  const at = official.indexOf(": ");
  return at > 0
    ? { provider: official.slice(0, at), name: official.slice(at + 2) }
    : { provider: "", name: official };
}

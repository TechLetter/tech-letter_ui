import { useEffect, useState } from "react";
import searchApi from "../api/searchApi";
import { toApiError } from "../api/apiError";
import { useAuth } from "./useAuth";

/**
 * 검색 결과 AI 요약 — 로그인해 있으면 결과가 뜨자마자 부른다. 크레딧은 들지 않는다.
 * 같은 검색어·같은 상위 글이면 서버가 저장해 둔 답을 준다(7일).
 */
export function useAiSummary(query, postIds) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState("idle"); // idle · loading · done · error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const idsKey = postIds.join(",");

  useEffect(() => {
    if (!isAuthenticated || !query || !idsKey) {
      setState("idle");
      setResult(null);
      return undefined;
    }
    const controller = new AbortController();
    setState("loading");
    setResult(null);
    setError(null);
    searchApi
      .summary({ query, postIds: idsKey.split(","), signal: controller.signal })
      .then((data) => {
        setResult({
          key: data.key,
          answer: data.answer,
          sources: data.sources || [],
          modelId: data.model_id || "",
        });
        setState("done");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(toApiError(err));
        setState("error");
      });
    return () => controller.abort();
  }, [isAuthenticated, query, idsKey]);

  // 로그인 상태면 첫 렌더부터 로딩으로 보인다(로그인 버튼이 번쩍이지 않게).
  const shown = isAuthenticated && state === "idle" ? "loading" : state;
  return { state: shown, result, error };
}

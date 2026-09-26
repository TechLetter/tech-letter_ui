import { useCallback, useEffect, useRef, useState } from "react";
import chatApi from "../api/chatApi";
import { ErrorCode, toApiError } from "../api/apiError";
import { showLoginRequiredModal } from "../provider/loginRequiredModalBridge";
import { useAuth } from "./useAuth";
import { useLoginGate } from "./useLoginGate";

/**
 * 검색 결과의 AI 요약 — 새 대화를 열고 상위 글 id 를 근거로 챗봇 메시지 하나를 보낸다.
 * 크레딧 1 이 든다. 검색어가 바뀌면 처음으로 돌아간다.
 */
export function useAiSummary(query, postIds) {
  const { updateCredits } = useAuth();
  const gate = useLoginGate();
  const [state, setState] = useState("idle"); // idle · loading · done · error · nocredit
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    controllerRef.current?.abort();
    setState("idle");
    setResult(null);
    setError(null);
  }, [query]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setState("idle");
  }, []);

  const run = useCallback(async () => {
    if (!gate()) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState("loading");
    setError(null);
    try {
      const session = await chatApi.createSession();
      const data = await chatApi.streamChatRequest(query, session.id, {
        postIds,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setResult({
        answer: data.answer,
        sources: data.sources || [],
        modelId: data.agent?.model_id || "",
        sessionId: data.session_id || session.id,
      });
      if (data.credits) updateCredits(data.credits);
      setState("done");
    } catch (err) {
      if (controller.signal.aborted) return;
      const apiError = toApiError(err);
      if (apiError.code === ErrorCode.AUTH_REQUIRED || apiError.code === ErrorCode.AUTH_INVALID_TOKEN) {
        setState("idle");
        showLoginRequiredModal();
        return;
      }
      if (apiError.code === ErrorCode.CREDIT_INSUFFICIENT) {
        setState("nocredit");
        return;
      }
      setError(apiError);
      setState("error");
    }
  }, [gate, query, postIds, updateCredits]);

  return { state, result, error, run, stop, reset: () => setState("idle") };
}

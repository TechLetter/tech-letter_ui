import { useCallback } from "react";
import { PATHS } from "../routes/path";
import { useLoginGate } from "./useLoginGate";

/** 헤더 버튼과 하단 탭이 같은 규칙으로 챗봇에 들어간다 — 비로그인이면 로그인 모달. */
export function useChatbotEntry() {
  const gate = useLoginGate();
  return useCallback(() => gate(PATHS.CHATBOT), [gate]);
}

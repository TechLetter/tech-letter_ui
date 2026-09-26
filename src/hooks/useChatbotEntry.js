import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../routes/path";
import { useAuth } from "./useAuth";
import { showLoginRequiredModal } from "../provider/loginRequiredModalBridge";

/** 헤더 버튼과 하단 탭이 같은 규칙으로 챗봇에 들어간다 — 비로그인이면 로그인 모달. */
export function useChatbotEntry() {
  const navigate = useNavigate();
  const { initialized, isAuthenticated } = useAuth();

  return useCallback(() => {
    if (initialized && !isAuthenticated) {
      showLoginRequiredModal();
      return;
    }
    navigate(PATHS.CHATBOT);
  }, [initialized, isAuthenticated, navigate]);
}

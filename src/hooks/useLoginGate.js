import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { showLoginRequiredModal } from "../provider/loginRequiredModalBridge";
import { PATHS } from "../routes/path";

/**
 * 로그인이 필요한 화면으로 가는 길목. 비로그인이면 로그인 페이지로 보내지 않고 모달부터 띄운다.
 * 로그인 확인이 아직 안 끝났으면 일단 이동하고, 도착한 화면이 같은 규칙으로 막는다.
 */
export function useLoginGate() {
  const navigate = useNavigate();
  const { initialized, isAuthenticated } = useAuth();

  return useCallback(
    (path) => {
      if (initialized && !isAuthenticated) {
        showLoginRequiredModal();
        return false;
      }
      if (path) navigate(path);
      return true;
    },
    [initialized, isAuthenticated, navigate]
  );
}

/** 로그인이 필요한 화면에 비로그인으로 들어오면(주소 직접 입력 등) 홈으로 돌리고 모달을 띄운다. */
export function useRequireLogin() {
  const navigate = useNavigate();
  const { initialized, isAuthenticated } = useAuth();

  return useCallback(() => {
    if (!initialized || isAuthenticated) return;
    navigate(PATHS.HOME, { replace: true });
    showLoginRequiredModal();
  }, [initialized, isAuthenticated, navigate]);
}

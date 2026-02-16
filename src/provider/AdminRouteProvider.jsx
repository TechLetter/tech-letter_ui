import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PATHS } from "../routes/path";

/**
 * 관리자 권한이 필요한 라우트를 감싸는 Guard 컴포넌트
 * - 인증되지 않았거나 관리자가 아니면 홈으로 리다이렉트
 * - 로딩 중에는 null 반환 (깜빡임 방지)
 */
export default function AdminRouteProvider({ children }) {
  const { initialized, isAuthenticated, isAdmin } = useAuth();

  // 인증 상태 로딩 중
  if (!initialized) {
    return null;
  }

  // 권한 없음 -> 홈으로 리다이렉트
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  return children;
}

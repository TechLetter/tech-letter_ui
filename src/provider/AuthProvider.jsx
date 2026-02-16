import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import authApi from "../api/authApi";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../utils/authToken";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedProfileRef = useRef(false);

  useEffect(() => {
    if (hasLoadedProfileRef.current) return;
    hasLoadedProfileRef.current = true;

    const token = getAccessToken();
    if (!token) {
      setInitialized(true);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await authApi.getProfile();
        setUser(response.data);
        setError(null);
      } catch {
        clearAccessToken();
        setUser(null);
        setError("세션이 만료되었어요. 다시 로그인해 주세요.");
      } finally {
        setInitialized(true);
      }
    };

    loadProfile();
  }, []);

  const loginWithToken = useCallback(async (token) => {
    setAccessToken(token);
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
      setError(null);
    } catch (err) {
      clearAccessToken();
      setUser(null);
      setError("로그인 처리 중 오류가 발생했어요.");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  // 크레딧 잔액 로컬 업데이트 (채팅 응답 후 사용)
  const updateCredits = useCallback((newCredits) => {
    setUser((prev) => (prev ? { ...prev, credits: newCredits } : prev));
  }, []);

  const isAdmin = user?.role === "admin";

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    initialized,
    error,
    loginWithToken,
    logout,
    updateCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

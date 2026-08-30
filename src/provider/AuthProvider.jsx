import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import authApi from "../api/authApi";
import { onSessionExpired } from "../api/client";
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

  // 어떤 요청에서든 401 이 나면 로그인 상태를 비운다. 만료된 토큰으로
  // 화면만 로그인된 것처럼 보이던 상태를 없앤다.
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        setError("세션이 만료되었어요. 다시 로그인해 주세요.");
      }),
    []
  );

  /** 채팅 응답의 `credits` 객체를 그대로 반영한다. */
  const updateCredits = useCallback((credits) => {
    setUser((prev) => (prev ? { ...prev, credits } : prev));
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

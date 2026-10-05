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

// 크레딧은 UTC 자정 기준이다. 날짜가 바뀐 뒤 처음 보는 순간 `/me`가 일일 크레딧을 준다.
const utcDay = () => new Date().toISOString().slice(0, 10);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedProfileRef = useRef(false);
  const profileDayRef = useRef(utcDay());

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

  // 탭을 열어 둔 채 날이 바뀌면, 다시 볼 때 프로필을 새로 받아 일일 크레딧을 반영한다.
  const isLoggedIn = !!user;
  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const refreshOnNewDay = async () => {
      if (document.visibilityState !== "visible" || profileDayRef.current === utcDay()) return;
      profileDayRef.current = utcDay();
      try {
        const response = await authApi.getProfile();
        setUser(response.data);
      } catch {
        // 401은 onSessionExpired가 처리한다. 나머지는 다음 기회에 다시 받는다.
      }
    };
    document.addEventListener("visibilitychange", refreshOnNewDay);
    return () => document.removeEventListener("visibilitychange", refreshOnNewDay);
  }, [isLoggedIn]);

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

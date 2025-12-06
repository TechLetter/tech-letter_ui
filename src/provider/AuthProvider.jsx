import {
  createContext,
  useContext,
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

const AuthContext = createContext(null);

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
      } catch (err) {
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

  const isAdmin = user?.role === "admin";

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    initialized,
    error,
    loginWithToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}

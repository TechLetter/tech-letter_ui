const ACCESS_TOKEN_KEY = "TECHLETTER_ACCESS_TOKEN";

export const getAccessToken = () => {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch (error) {
    return "";
  }
};

export const setAccessToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    if (!token) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    // storage 실패 시 조용히 무시 (기능은 동작하되, 영속성만 포기)
  }
};

export const clearAccessToken = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    // ignore
  }
};

import apiClient from "./client";

const buildGoogleLoginUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const trimmedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmedBaseUrl}/api/v1/auth/google/login`;
};

const authApi = {
  getProfile: () => apiClient.get("/api/v1/users/profile"),
  getGoogleLoginUrl: () => buildGoogleLoginUrl(),
  exchangeSession: (session) =>
    apiClient.post("/api/v1/auth/session/exchange", { session }),
  deleteMe: () => apiClient.delete("/api/v1/users/me"),
};

export default authApi;

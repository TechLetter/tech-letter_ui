import apiClient from "./client";

const buildGoogleLoginUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return `${baseUrl.replace(/\/$/, "")}/api/v1/auth/google/login`;
};

const authApi = {
  getProfile: () => apiClient.get("/api/v1/me"),
  getGoogleLoginUrl: () => buildGoogleLoginUrl(),
  exchangeSession: (session) => apiClient.post("/api/v1/auth/token", { session }),
  deleteMe: () => apiClient.delete("/api/v1/me"),
};

export default authApi;

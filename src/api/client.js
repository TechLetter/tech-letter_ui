import axios from "axios";
import qs from "qs";
import { clearAccessToken, getAccessToken } from "../utils/authToken";
import { ApiError, ErrorCode, toApiError } from "./apiError";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "repeat", skipNulls: true }),
});

const cleanParams = (params) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
};

apiClient.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === "get" && config.params) {
    config.params = cleanParams(config.params);
  }

  const token = getAccessToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  return config;
});

/** 401 을 받으면 토큰을 버린다. 만료된 토큰을 계속 들고 있을 이유가 없다. */
const onUnauthorized = new Set();

export const onSessionExpired = (listener) => {
  onUnauthorized.add(listener);
  return () => onUnauthorized.delete(listener);
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = toApiError(error);
    if (
      normalized instanceof ApiError &&
      normalized.is(ErrorCode.AUTH_REQUIRED, ErrorCode.AUTH_INVALID_TOKEN)
    ) {
      clearAccessToken();
      onUnauthorized.forEach((listener) => listener(normalized));
    }
    return Promise.reject(normalized);
  }
);

export default apiClient;

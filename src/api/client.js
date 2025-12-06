import axios from "axios";
import qs from "qs";
import { getAccessToken } from "../utils/authToken";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      arrayFormat: "repeat",
      skipNulls: true,
    });
  },
});

const cleanParams = (params) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ""
    )
  );
};

apiClient.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === "get" && config.params) {
    config.params = cleanParams(config.params);
  }

  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default apiClient;

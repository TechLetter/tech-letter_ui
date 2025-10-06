import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
  return config;
});

export default apiClient;

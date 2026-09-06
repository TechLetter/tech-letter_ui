import apiClient from "./client";

/** 전부 비로그인 공개 엔드포인트다. model_id는 슬래시를 포함해 path 파라미터로 그대로 나간다. */
const llmModelsApi = {
  getSummary: () => apiClient.get("/api/v1/llm-models/summary"),

  getModels: () => apiClient.get("/api/v1/llm-models"),

  getHistory: (modelId, { period = "1m" } = {}) =>
    apiClient.get(`/api/v1/llm-models/${encodeURIComponent(modelId)}/history`, {
      params: { period },
    }),

  getEvents: ({ modelId, limit = 30 } = {}) =>
    apiClient.get("/api/v1/llm-models/events", {
      params: { model_id: modelId, limit },
    }),
};

export default llmModelsApi;

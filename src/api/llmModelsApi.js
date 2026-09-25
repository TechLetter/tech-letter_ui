import apiClient from "./client";

/** 비로그인 공개 엔드포인트. 목록에는 모델별 상태와 최근 30일 일별 가용률이 함께 온다. */
const llmModelsApi = {
  getSummary: () => apiClient.get("/api/v1/llm-models/summary"),

  getModels: () => apiClient.get("/api/v1/llm-models"),
};

export default llmModelsApi;

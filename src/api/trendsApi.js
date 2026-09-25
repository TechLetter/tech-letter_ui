import apiClient from "./client";

const trendsApi = {
  /** 최근 7일 대 직전 7일. 주제별로 다룬 블로그 수·글 수와 대표 글을 준다. */
  getWeekly: ({ limit = 8 } = {}) =>
    apiClient.get("/api/v1/trends/weekly", { params: { limit } }),
};

export default trendsApi;

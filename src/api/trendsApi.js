import apiClient from "./client";

/** `series` 키가 `items` 로 바뀌었다(04 §3.7). 나머지 구조는 그대로다. */
const trendsApi = {
  getRisingTags: ({ period = "180d", limit = 5 } = {}) =>
    apiClient.get("/api/v1/trends/rising", { params: { period, limit } }),

  getSeries: ({ tags = [], period = "180d", interval = "week" } = {}) =>
    apiClient.get("/api/v1/trends/series", { params: { tags, period, interval } }),

  getPosts: ({ tags = [], period = "180d", page = 1, page_size = 10 } = {}) =>
    apiClient.get("/api/v1/trends/posts", { params: { tags, period, page, page_size } }),
};

export default trendsApi;

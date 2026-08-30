import apiClient from "./client";

/** 응답의 시리즈 데이터는 `items` 키에 담겨 온다. */
const trendsApi = {
  getRisingTags: ({ period = "180d", limit = 5 } = {}) =>
    apiClient.get("/api/v1/trends/rising", { params: { period, limit } }),

  getSeries: ({ tags = [], period = "180d", interval = "week" } = {}) =>
    apiClient.get("/api/v1/trends/series", { params: { tags, period, interval } }),

  getPosts: ({ tags = [], period = "180d", page = 1, page_size = 10 } = {}) =>
    apiClient.get("/api/v1/trends/posts", { params: { tags, period, page, page_size } }),
};

export default trendsApi;

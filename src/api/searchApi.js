import apiClient from "./client";

/** 검색 제안. 제목 기준 상위 5개 — `{items: [{id, title, blog_id, blog_name, published_at}], total}`. */
const searchApi = {
  suggest: ({ q, signal }) =>
    apiClient.get("/api/v1/search/suggest", { params: { q }, signal }),
};

export default searchApi;

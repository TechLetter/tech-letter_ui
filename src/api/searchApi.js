import apiClient from "./client";

const searchApi = {
  /** 검색 제안. 제목 기준 상위 5개 — `{items: [{id, title, blog_id, blog_name, published_at}], total}`. */
  suggest: ({ q, signal }) =>
    apiClient.get("/api/v1/search/suggest", { params: { q }, signal }),

  /** 검색 결과 AI 요약 — `{key, answer, sources, model_id, cached}`. 크레딧 없이 7일 캐시. */
  summary: async ({ query, postIds, signal }) => {
    const response = await apiClient.post(
      "/api/v1/search/summary",
      { query, post_ids: postIds.slice(0, 8) },
      { signal }
    );
    return response.data;
  },

  /** 요약의 질문과 답을 담은 챗봇 세션을 만든다 — `{session_id}`. */
  continueSummary: async (key) => {
    const response = await apiClient.post("/api/v1/search/summary/continue", { key });
    return response.data;
  },
};

export default searchApi;

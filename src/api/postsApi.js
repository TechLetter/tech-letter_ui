import apiClient from "./client";

/**
 * 공개 포스트 API.
 *
 * 공개 API 는 요약이 끝난 포스트만 준다.
 */
const postsApi = {
  // sort: "views" 면 조회순(같으면 최신순), 없으면 최신순.
  getPosts: ({ page, page_size, categories, blog_id, published_from, published_to, sort }) =>
    apiClient.get("/api/v1/posts", {
      params: { page, page_size, categories, blog_id, published_from, published_to, sort },
    }),
  getPost: (id) => apiClient.get(`/api/v1/posts/${id}`),
  incrementViewCount: (id) => apiClient.post(`/api/v1/posts/${id}/views`),
};

export default postsApi;

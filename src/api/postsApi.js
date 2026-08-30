import apiClient from "./client";

/**
 * 공개 포스트 API.
 *
 * 공개 API 는 요약이 끝난 포스트만 준다.
 */
const postsApi = {
  getPosts: ({ page, page_size, categories, tags, blog_id, published_from, published_to }) =>
    apiClient.get("/api/v1/posts", {
      params: { page, page_size, categories, tags, blog_id, published_from, published_to },
    }),
  getPost: (id) => apiClient.get(`/api/v1/posts/${id}`),
  incrementViewCount: (id) => apiClient.post(`/api/v1/posts/${id}/views`),
};

export default postsApi;

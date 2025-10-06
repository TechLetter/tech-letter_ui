import apiClient from "./client";

const postsApi = {
  getPosts: ({ page, page_size, categories, tags, blog_id, blog_name }) =>
    apiClient.get("/api/v1/posts", {
      params: {
        page,
        page_size,
        categories,
        tags,
        blog_id,
        blog_name,
      },
    }),
  getPost: (id) => apiClient.get(`/api/v1/posts/${id}`),
  incrementViewCount: (id) => apiClient.post(`/api/v1/posts/${id}/view`),
};

export default postsApi;

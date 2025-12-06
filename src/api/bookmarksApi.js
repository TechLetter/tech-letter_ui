import apiClient from "./client";

const bookmarksApi = {
  addBookmark: (postId) => apiClient.post(`/api/v1/posts/${postId}/bookmark`),
  removeBookmark: (postId) =>
    apiClient.delete(`/api/v1/posts/${postId}/bookmark`),
  getBookmarks: ({ page, page_size }) =>
    apiClient.get("/api/v1/posts/bookmarks", {
      params: { page, page_size },
    }),
};

export default bookmarksApi;

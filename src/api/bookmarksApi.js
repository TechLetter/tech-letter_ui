import apiClient from "./client";

/** 북마크는 독립 리소스다 — `/posts/{id}/bookmark` 가 아니다. */
const bookmarksApi = {
  addBookmark: (postId) => apiClient.post("/api/v1/bookmarks", { post_id: postId }),
  removeBookmark: (postId) => apiClient.delete(`/api/v1/bookmarks/${postId}`),
  getBookmarks: ({ page, page_size }) =>
    apiClient.get("/api/v1/bookmarks", { params: { page, page_size } }),
};

export default bookmarksApi;

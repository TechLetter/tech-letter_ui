import apiClient from "./client";

const blogsApi = {
    getBlogs: ({ page, page_size }) =>
        apiClient.get("/api/v1/blogs", {
            params: {
                page,
                page_size,
            },
        }),
};

export default blogsApi;
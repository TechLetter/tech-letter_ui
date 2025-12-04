import apiClient from "./client";

const filtersApi = {
    getCategories: ({ blog_id, tags }) =>
        apiClient.get("/api/v1/filters/categories", {
            params: {
                blog_id,
                tags,
            },
        }),

    getBlogs: ({ categories, tags }) =>
        apiClient.get("/api/v1/filters/blogs", {
            params: {
                categories,
                tags,
            },
        }),

    getTags: ({ blog_id, categories }) =>
        apiClient.get("/api/v1/filters/tags", {
            params: {
                blog_id,
                categories,
            },
        }),
};

export default filtersApi;
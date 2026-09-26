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

    // 부모 주제와 자식 주제. 목록이 서버 코드에 있어 거의 바뀌지 않는다.
    getTopicGroups: () => apiClient.get("/api/v1/filters/topic-groups"),

    getTags: ({ blog_id, categories }) =>
        apiClient.get("/api/v1/filters/tags", {
            params: {
                blog_id,
                categories,
            },
        }),
};

export default filtersApi;
import React, { useCallback, useEffect, useRef, useState } from "react";
import postsApi from "../api/postsApi";
import filtersApi from "../api/filtersApi";
import HomeFilterSection from "../components/home/HomeFilterSection";
import HomePostListSection from "../components/home/HomePostListSection";
import { mergeUniqueByKey } from "../utils/arrayUtils";
import { useUrlState } from "../hooks/useUrlState";

const PAGE_SIZE = 12;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [blogFilters, setBlogFilters] = useState([]);
  const [tagFilters, setTagFilters] = useState([]);

  // URL 동기화되는 필터 상태
  const [selectedCategory, setSelectedCategory] = useUrlState("category", "");
  const [selectedBlogId, setSelectedBlogId] = useUrlState("blog", "");
  const [selectedTags, setSelectedTags] = useUrlState("tags", [], {
    parse: (v) => (v ? v.split(",") : []),
    serialize: (v) => (Array.isArray(v) && v.length > 0 ? v.join(",") : ""),
  });

  const fetchPosts = useCallback(async (pageNum = 1, resetPosts = false) => {
    setLoading(true);
    try {
      const res = await postsApi.getPosts({
        page: pageNum,
        page_size: PAGE_SIZE,
        categories: selectedCategory,
        blog_id: selectedBlogId,
        tags: selectedTags,
      });
      const data = res.data;

      if (data.data.length < PAGE_SIZE) setHasMore(false);

      setPosts((prevPosts) => {
        if (resetPosts) {
          return mergeUniqueByKey([], data.data, "id");
        }
        return mergeUniqueByKey(prevPosts, data.data, "id");
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedBlogId, selectedTags]);

  const fetchPostsRef = useRef(fetchPosts);

  useEffect(() => {
    fetchPostsRef.current = fetchPosts;
  }, [fetchPosts]);

  const loadCategoryFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getCategories({
        blog_id: selectedBlogId,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setCategoryFilters(
        res?.data?.items.filter((item) => item.count > 0) || []
      );
    } catch (err) {
      console.log("Failed to fetch category filters:", err);
      setCategoryFilters([]);
    }
  }, [selectedBlogId, selectedTags]);

  const loadBlogFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getBlogs({
        categories: [selectedCategory],
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setBlogFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch blog filters:", err);
      setBlogFilters([]);
    }
  }, [selectedCategory, selectedTags]);

  const loadTagFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getTags({
        blog_id: selectedBlogId,
        categories: [selectedCategory],
      });
      setTagFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch tag filters:", err);
      setTagFilters([]);
    }
  }, [selectedBlogId, selectedCategory]);

  // Load all filters on mount and when selection changes
  useEffect(() => {
    loadCategoryFilters();
    loadBlogFilters();
    loadTagFilters();
  }, [loadCategoryFilters, loadBlogFilters, loadTagFilters]);

  useEffect(() => {
    fetchPostsRef.current(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPostsRef.current(1, true);
  }, [selectedCategory, selectedBlogId, selectedTags]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="w-full">
      {/* 필터 영역 - 카테고리 & 블로그 */}
      <HomeFilterSection
        categoryFilters={categoryFilters}
        blogFilters={blogFilters}
        tagFilters={tagFilters}
        selectedCategory={selectedCategory}
        selectedBlogId={selectedBlogId}
        selectedTags={selectedTags}
        onChangeCategory={setSelectedCategory}
        onChangeBlog={setSelectedBlogId}
        onChangeTags={setSelectedTags}
      />
      {/* 포스트 그리드 */}
      <HomePostListSection posts={posts} loading={loading} hasMore={hasMore} />
    </div>
  );
}

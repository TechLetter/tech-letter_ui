import React, { useEffect, useState } from "react";
import postsApi from "../api/postsApi";
import filtersApi from "../api/filtersApi";
import HomeFilterSection from "../components/home/HomeFilterSection";
import HomePostListSection from "../components/home/HomePostListSection";
import { mergeUniqueByKey } from "../utils/arrayUtils";

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

  // Selected filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchPosts = async (pageNum = 1, resetPosts = false) => {
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
  };

  const loadCategoryFilters = async () => {
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
  };

  const loadBlogFilters = async () => {
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
  };

  const loadTagFilters = async () => {
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
  };

  // Load all filters on mount and when selection changes
  useEffect(() => {
    loadCategoryFilters();
    loadBlogFilters();
    loadTagFilters();
  }, [selectedCategory, selectedBlogId, selectedTags]);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
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

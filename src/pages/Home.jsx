import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import postsApi from "../api/postsApi";
import filtersApi from "../api/filtersApi";
import trendsApi from "../api/trendsApi";
import HomeFilterSection from "../components/home/HomeFilterSection";
import HomePostListSection from "../components/home/HomePostListSection";
import HomeRail, { TrendStrip } from "../components/home/HomeRail";
import { mergeUniqueByKey } from "../utils/arrayUtils";
import { useUrlParams, useUrlState } from "../hooks/useUrlState";

const PAGE_SIZE = 12;
const RAIL_TOPIC_LIMIT = 5;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [trends, setTrends] = useState(null);
  const [topicGroups, setTopicGroups] = useState(null);

  // Filter states
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [blogFilters, setBlogFilters] = useState([]);
  const [tagFilters, setTagFilters] = useState([]);

  // URL 동기화되는 필터 상태
  const [selectedGroup] = useUrlState("group", "");
  const [selectedCategory] = useUrlState("category", "");
  const [selectedBlogId] = useUrlState("blog", "");
  const [sort] = useUrlState("sort", "");
  const [selectedTags] = useUrlState("tags", [], {
    parse: (v) => (v ? v.split(",") : []),
    serialize: (v) => (Array.isArray(v) && v.length > 0 ? v.join(",") : ""),
  });
  const { updateParams } = useUrlParams();

  const groupOfTopic = useCallback(
    (name) => (topicGroups || []).find((group) => group.topics.includes(name))?.id || "",
    [topicGroups]
  );
  // 자식 주제가 있으면 부모는 거기서 정한다 — 트렌드의 `?category=` 링크가 그대로 탭을 연다.
  const activeGroup = selectedCategory ? groupOfTopic(selectedCategory) : selectedGroup;
  // 부모만 골랐으면 자식 전체를 OR 로 조회한다.
  const categoryParams = useMemo(() => {
    if (selectedCategory) return [selectedCategory];
    return (topicGroups || []).find((group) => group.id === activeGroup)?.topics || [];
  }, [selectedCategory, activeGroup, topicGroups]);
  const categoryKey = categoryParams.join("|");
  // 부모 탭이 URL 에 있는데 묶음을 아직 못 받았으면 전체 글을 잠깐 보여 주지 않고 기다린다.
  const waitingForGroups = Boolean(selectedGroup && !selectedCategory && topicGroups === null);

  const selectGroup = useCallback(
    (groupId) => updateParams({ group: groupId || null, category: null }),
    [updateParams]
  );
  const selectCategory = useCallback(
    (name) => updateParams({ category: name || null, group: name ? groupOfTopic(name) || null : activeGroup || null }),
    [updateParams, activeGroup, groupOfTopic]
  );
  const changeSort = useCallback((value) => updateParams({ sort: value || null }), [updateParams]);
  const changeBlog = useCallback((blogId) => updateParams({ blog: blogId || null }), [updateParams]);
  const changeTags = useCallback(
    (tags) => updateParams({ tags: Array.isArray(tags) && tags.length > 0 ? tags.join(",") : null }),
    [updateParams]
  );
  const applyFilters = useCallback(
    ({ blogId, tags }) =>
      updateParams({
        blog: blogId || null,
        tags: Array.isArray(tags) && tags.length > 0 ? tags.join(",") : null,
      }),
    [updateParams]
  );
  const clearFilters = useCallback(
    () => updateParams({ group: null, category: null, blog: null, tags: null }),
    [updateParams]
  );

  const fetchPosts = useCallback(
    async (pageNum = 1, resetPosts = false) => {
      setLoading(true);
      try {
        const res = await postsApi.getPosts({
          page: pageNum,
          page_size: PAGE_SIZE,
          categories: categoryParams,
          blog_id: selectedBlogId,
          tags: selectedTags,
          sort: sort || undefined,
        });
        const { items, page: current, total_pages } = res.data;

        // 서버가 총 페이지 수를 준다. `items.length < PAGE_SIZE` 로 추론하지
        // 않는다 — 마지막 페이지가 정확히 꽉 찬 경우를 틀리게 판단했다.
        setHasMore(current < total_pages);

        setPosts((prevPosts) => mergeUniqueByKey(resetPosts ? [] : prevPosts, items, "id"));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    [categoryParams, selectedBlogId, selectedTags, sort]
  );

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
      setCategoryFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch category filters:", err);
      setCategoryFilters([]);
    }
  }, [selectedBlogId, selectedTags]);

  const loadBlogFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getBlogs({
        categories: categoryParams,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setBlogFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch blog filters:", err);
      setBlogFilters([]);
    }
  }, [categoryParams, selectedTags]);

  const loadTagFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getTags({
        blog_id: selectedBlogId,
        categories: categoryParams,
      });
      setTagFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch tag filters:", err);
      setTagFilters([]);
    }
  }, [selectedBlogId, categoryParams]);

  // Load all filters on mount and when selection changes
  useEffect(() => {
    loadCategoryFilters();
    loadBlogFilters();
    loadTagFilters();
  }, [loadCategoryFilters, loadBlogFilters, loadTagFilters]);

  // 주제 묶음은 한 번만. 실패하면 부모 탭 없이 '전체' 만 둔다.
  useEffect(() => {
    let ignore = false;
    filtersApi
      .getTopicGroups()
      .then((res) => {
        if (!ignore) setTopicGroups(res?.data?.items || []);
      })
      .catch(() => {
        if (!ignore) setTopicGroups([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 이번 주 흐름은 한 번만. 실패하면 레일을 비워 둔다.
  useEffect(() => {
    let ignore = false;
    trendsApi
      .getWeekly({ limit: RAIL_TOPIC_LIMIT })
      .then((res) => {
        if (!ignore) setTrends(res?.data || null);
      })
      .catch(() => {
        if (!ignore) setTrends(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (page > 1) fetchPostsRef.current(page);
  }, [page]);

  useEffect(() => {
    if (waitingForGroups) return;
    setPage(1);
    setHasMore(true);
    fetchPostsRef.current(1, true);
  }, [categoryKey, selectedBlogId, selectedTags, sort, waitingForGroups]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
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
    <div className="w-full xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-8">
      <div className="min-w-0">
        <HomeFilterSection
          topicGroups={topicGroups || []}
          activeGroup={activeGroup}
          sort={sort}
          onChangeSort={changeSort}
          selectedCategory={selectedCategory}
          categoryFilters={categoryFilters}
          blogFilters={blogFilters}
          tagFilters={tagFilters}
          selectedBlogId={selectedBlogId}
          selectedTags={selectedTags}
          onSelectGroup={selectGroup}
          onSelectCategory={selectCategory}
          onChangeBlog={changeBlog}
          onChangeTags={changeTags}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />
        <TrendStrip trends={trends} onSelectCategory={selectCategory} />
        <HomePostListSection
          posts={posts}
          loading={loading}
          hasMore={hasMore}
          onSelectBlog={changeBlog}
          onClearFilters={clearFilters}
        />
      </div>
      <div className="hidden xl:block">
        <HomeRail
          trends={trends}
          blogFilters={blogFilters}
          onSelectCategory={selectCategory}
          onSelectBlog={changeBlog}
        />
      </div>
    </div>
  );
}

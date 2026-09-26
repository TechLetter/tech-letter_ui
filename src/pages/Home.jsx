import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import postsApi from "../api/postsApi";
import filtersApi from "../api/filtersApi";
import trendsApi from "../api/trendsApi";
import HomeFilterSection from "../components/home/HomeFilterSection";
import HomePostListSection from "../components/home/HomePostListSection";
import HomeSidebar from "../components/home/HomeSidebar";
import TrendStrip from "../components/home/TrendStrip";
import AiSummaryCard from "../components/search/AiSummaryCard";
import { searchTerms } from "../utils/searchTerms";
import { useLoginGate } from "../hooks/useLoginGate";
import { PATHS } from "../routes/path";
import { mergeUniqueByKey } from "../utils/arrayUtils";
import { useUrlParams, useUrlState } from "../hooks/useUrlState";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 12;
const TREND_LIMIT = 5;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(null);
  const [trends, setTrends] = useState(null);
  const [topicGroups, setTopicGroups] = useState(null);

  // Filter states
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [blogFilters, setBlogFilters] = useState([]);

  // URL 동기화되는 필터 상태
  const [selectedGroup] = useUrlState("group", "");
  const [selectedCategory] = useUrlState("category", "");
  const [selectedBlogId] = useUrlState("blog", "");
  // 검색어. 있으면 관련순 결과, 없으면 최신 피드.
  const [searchQuery] = useUrlState("q", "");
  const { updateParams } = useUrlParams();
  const navigate = useNavigate();
  const gate = useLoginGate();
  const q = searchQuery.trim();
  const highlightTerms = useMemo(() => searchTerms(q), [q]);

  const groupOfTopic = useCallback(
    (name) => (topicGroups || []).find((group) => group.topics.includes(name))?.id || "",
    [topicGroups]
  );
  // 자식 주제가 있으면 부모는 거기서 정한다 — 트렌드의 `?category=` 링크가 그대로 트리를 편다.
  const activeGroup = selectedCategory ? groupOfTopic(selectedCategory) : selectedGroup;
  // 부모만 골랐으면 자식 전체를 OR 로 조회한다.
  const categoryParams = useMemo(() => {
    if (selectedCategory) return [selectedCategory];
    return (topicGroups || []).find((group) => group.id === activeGroup)?.topics || [];
  }, [selectedCategory, activeGroup, topicGroups]);
  const categoryKey = categoryParams.join("|");
  // 부모가 URL 에 있는데 묶음을 아직 못 받았으면 전체 글을 잠깐 보여 주지 않고 기다린다.
  const waitingForGroups = Boolean(selectedGroup && !selectedCategory && topicGroups === null);

  const selectGroup = useCallback(
    (groupId) => updateParams({ group: groupId || null, category: null }),
    [updateParams]
  );
  const selectCategory = useCallback(
    (name) => updateParams({ category: name || null, group: name ? groupOfTopic(name) || null : activeGroup || null }),
    [updateParams, activeGroup, groupOfTopic]
  );
  const changeBlog = useCallback((blogId) => updateParams({ blog: blogId || null }), [updateParams]);
  const clearFilters = useCallback(
    () => updateParams({ group: null, category: null, blog: null }),
    [updateParams]
  );
  const closeSearch = useCallback(() => updateParams({ q: null }), [updateParams]);
  const askChatbot = useCallback(() => {
    if (gate()) navigate(`${PATHS.CHATBOT}?q=${encodeURIComponent(q)}`);
  }, [gate, navigate, q]);

  const fetchPosts = useCallback(
    async (pageNum = 1, resetPosts = false) => {
      setLoading(true);
      try {
        const res = await postsApi.getPosts({
          page: pageNum,
          page_size: PAGE_SIZE,
          q: q || undefined,
          categories: categoryParams,
          blog_id: selectedBlogId,
        });
        const { items, page: current, total_pages, total: totalCount } = res.data;
        setTotal(typeof totalCount === "number" ? totalCount : null);

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
    [categoryParams, selectedBlogId, q]
  );

  const fetchPostsRef = useRef(fetchPosts);

  useEffect(() => {
    fetchPostsRef.current = fetchPosts;
  }, [fetchPosts]);

  // 자식 개수는 출처를, 출처 개수는 주제를 반영한다.
  const loadCategoryFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getCategories({ blog_id: selectedBlogId });
      setCategoryFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch category filters:", err);
      setCategoryFilters([]);
    }
  }, [selectedBlogId]);

  const loadBlogFilters = useCallback(async () => {
    try {
      const res = await filtersApi.getBlogs({ categories: categoryParams });
      setBlogFilters(res?.data?.items.filter((item) => item.count > 0) || []);
    } catch (err) {
      console.log("Failed to fetch blog filters:", err);
      setBlogFilters([]);
    }
  }, [categoryParams]);

  useEffect(() => {
    loadCategoryFilters();
    loadBlogFilters();
  }, [loadCategoryFilters, loadBlogFilters]);

  // 주제 묶음은 한 번만. 실패하면 부모 없이 '전체' 만 둔다.
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

  // 이번 주 흐름은 한 번만. 실패하면 카드·스트립을 비워 둔다.
  useEffect(() => {
    let ignore = false;
    trendsApi
      .getWeekly({ limit: TREND_LIMIT })
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
  }, [categoryKey, selectedBlogId, q, waitingForGroups]);

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

  const sidebarProps = {
    topicGroups: topicGroups || [],
    categoryFilters,
    blogFilters,
    activeGroup,
    selectedCategory,
    selectedBlogId,
    onSelectGroup: selectGroup,
    onSelectCategory: selectCategory,
    onChangeBlog: changeBlog,
  };

  return (
    <div className="w-full lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-8">
      {/* 헤더 아래부터 화면 바닥까지 고정. 목록은 카드 안에서 스크롤한다. */}
      <aside
        aria-label="필터"
        className="sticky top-[calc(var(--tl-header-h)+1.5rem)] hidden h-[calc(100vh-var(--tl-header-h)-2.5rem)] lg:block"
      >
        <HomeSidebar {...sidebarProps} trends={trends} />
      </aside>
      <div className="min-w-0">
        <HomeFilterSection
          {...sidebarProps}
          onClearFilters={clearFilters}
          searchQuery={q}
          searchTotal={q ? total : null}
          onCloseSearch={closeSearch}
        />
        {!q && <TrendStrip trends={trends} onSelectCategory={selectCategory} />}
        {q && posts.length > 0 && <AiSummaryCard query={q} posts={posts} />}
        <HomePostListSection
          posts={posts}
          loading={loading}
          hasMore={hasMore}
          onSelectBlog={changeBlog}
          onClearFilters={clearFilters}
          searchQuery={q}
          highlightTerms={highlightTerms}
          onAskChatbot={askChatbot}
        />
      </div>
    </div>
  );
}

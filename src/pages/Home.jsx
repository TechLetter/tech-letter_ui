import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import postsApi from "../api/postsApi";
import filtersApi from "../api/filtersApi";
import trendsApi from "../api/trendsApi";
import HomeFilterSection from "../components/home/HomeFilterSection";
import HomePostListSection from "../components/home/HomePostListSection";
import HomeSidebar from "../components/home/HomeSidebar";
import AiSummaryCard from "../components/search/AiSummaryCard";
import { searchTerms } from "../utils/searchTerms";
import { useLoginGate } from "../hooks/useLoginGate";
import { PATHS } from "../routes/path";
import { mergeUniqueByKey } from "../utils/arrayUtils";
import { useUrlParams, useUrlState } from "../hooks/useUrlState";

const PAGE_SIZE = 12;
const TREND_LIMIT = 5;

// 라우트를 떠나도 살아 있고, 새로고침하면 사라진다. 뒤로가기(POP) 복원 전용 —
// 필터가 바뀐 새 방문에는 쓰지 않는다(아래 feedKey 비교로 구분).
let feedCache = null; // { feedKey, posts, page, hasMore, total, scrollY }

export default function Home() {
  const navigate = useNavigate();
  const navType = useNavigationType();
  const gate = useLoginGate();

  // URL 동기화되는 필터 상태. feedKey 계산에 쓰이므로 posts 등 목록 상태보다 먼저 둔다 —
  // 뒤로가기 복원 때 첫 렌더부터 캐시된 값으로 그리려면 feedKey가 그 전에 확정돼야 한다.
  const [selectedGroup] = useUrlState("group", "");
  const [selectedCategory] = useUrlState("category", "");
  const [selectedBlogId] = useUrlState("blog", "");
  // 검색어. 있으면 관련순 결과, 없으면 최신 피드.
  const [searchQuery] = useUrlState("q", "");
  const { updateParams } = useUrlParams();
  const q = searchQuery.trim();
  const highlightTerms = useMemo(() => searchTerms(q), [q]);

  const [topicGroups, setTopicGroups] = useState(null);

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
  const feedKey = `${categoryKey}\n${selectedBlogId}\n${q}`;

  // 뒤로가기로 돌아왔고 직전에 떠난 피드와 같으면(필터·검색어 동일) 다시 받지 않고 첫 렌더부터
  // 캐시로 그린다 — effect 에서 뒤늦게 채우면 "조건에 맞는 글 없음" 빈 상태가 한 프레임 보인다.
  // waitingForGroups 조합(그룹만 선택해 feedKey가 아직 확정 전)은 복원하지 않고 새로 받는다 — 드문 경로라
  // 여기서까지 다루면 복잡도만 늘어난다.
  const canRestoreOnMount = !waitingForGroups && navType === "POP" && feedCache?.feedKey === feedKey;
  const [restoredOnMount] = useState(canRestoreOnMount); // 마운트 시점 값으로 고정

  const [posts, setPosts] = useState(() => (restoredOnMount ? feedCache.posts : []));
  const [page, setPage] = useState(() => (restoredOnMount ? feedCache.page : 1));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => (restoredOnMount ? feedCache.hasMore : true));
  const [total, setTotal] = useState(() => (restoredOnMount ? feedCache.total : null));
  const [trends, setTrends] = useState(null);

  // Filter states
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [blogFilters, setBlogFilters] = useState([]);

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

  // 마지막 요청만 반영한다 — 필터를 바꾼 뒤 늦게 온 이전 필터 응답이 목록에 섞이지 않게.
  const requestIdRef = useRef(0);

  const fetchPosts = useCallback(
    async (pageNum = 1, resetPosts = false) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const res = await postsApi.getPosts({
          page: pageNum,
          page_size: PAGE_SIZE,
          q: q || undefined,
          categories: categoryParams,
          blog_id: selectedBlogId,
        });
        if (requestId !== requestIdRef.current) return;
        const { items, page: current, total_pages, total: totalCount } = res.data;
        setTotal(typeof totalCount === "number" ? totalCount : null);

        // 서버가 총 페이지 수를 준다. `items.length < PAGE_SIZE` 로 추론하지
        // 않는다 — 마지막 페이지가 정확히 꽉 찬 경우를 틀리게 판단했다.
        setHasMore(current < total_pages);

        setPosts((prevPosts) => mergeUniqueByKey(resetPosts ? [] : prevPosts, items, "id"));
      } catch (err) {
        console.log(err);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
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

  // 이번 주 흐름은 한 번만(데스크톱 사이드바 카드용). 실패하면 카드를 비워 둔다.
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

  // 지금 보여 주는 목록이 어떤 feedKey 로 받은 것인지, 몇 쪽까지 받았는지. 복원이면 처음부터
  // 캐시 값으로 채워 둬서 아래 effect 가 "새 방문"으로 오인해 다시 받지 않게 한다.
  // 한 번 쓰고 버리는 플래그가 아니라 값 비교라서 StrictMode 의 effect 두 번 실행에도 안전하다.
  const feedKeyRef = useRef(restoredOnMount ? feedKey : null);
  const fetchedPageRef = useRef(restoredOnMount ? page : 1);
  // 복원 직후 스크롤 복원 자체가 "바닥 근처" 조건을 건드려 무한 스크롤이 연쇄로 다음 쪽을
  // 받지 않도록 짧게 억제한다.
  const suppressAutoFetchRef = useRef(restoredOnMount);

  // 뒤로가기 복원: 스크롤 위치만 되돌린다(카드는 이미 첫 렌더부터 그려져 있다).
  useEffect(() => {
    if (!restoredOnMount) return;
    const savedScrollY = feedCache?.scrollY ?? 0;
    const raf = requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
    const timer = setTimeout(() => {
      suppressAutoFetchRef.current = false;
    }, 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [restoredOnMount]);

  useEffect(() => {
    if (page <= 1 || page === fetchedPageRef.current) return;
    fetchedPageRef.current = page;
    fetchPostsRef.current(page);
  }, [page]);

  // 필터·검색이 바뀌면 피드 맨 위로 먼저 올린다. 그대로 두면 짧아진 새 목록 끝에 걸려
  // 무한 스크롤까지 당겨져 엉뚱한 위치(바닥)에 선다. 첫 진입은 건드리지 않는다.
  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    if (waitingForGroups) return;
    if (feedKeyRef.current === feedKey) return; // 이미 이 조건으로 받은(또는 복원한) 목록이다
    if (feedKeyRef.current !== null) window.scrollTo(0, 0);
    feedKeyRef.current = feedKey;
    fetchedPageRef.current = 1;
    setPage(1);
    setHasMore(true);
    fetchPostsRef.current(1, true);
  }, [feedKey, waitingForGroups]);

  useEffect(() => {
    const handleScroll = () => {
      if (suppressAutoFetchRef.current) return;
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

  // 나갈 때(카드 클릭 등) 스냅샷을 남긴다 — 뒤로가기 복원용. 새로고침하면 사라진다.
  const latestFeedRef = useRef(null);
  useEffect(() => {
    latestFeedRef.current = { feedKey, posts, page, hasMore, total };
  }, [feedKey, posts, page, hasMore, total]);

  // 스크롤 위치는 스크롤할 때마다 적어 둔다. 언마운트 클린업 시점에는 이미 상세 페이지 DOM으로
  // 바뀌어 문서가 짧아졌고, 브라우저가 scrollY를 그 높이로 깎아 놓았을 수 있다.
  const lastScrollYRef = useRef(restoredOnMount ? (feedCache?.scrollY ?? 0) : 0);
  useEffect(() => {
    const remember = () => {
      lastScrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);

  useEffect(
    () => () => {
      if (latestFeedRef.current) feedCache = { ...latestFeedRef.current, scrollY: lastScrollYRef.current };
    },
    []
  );

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

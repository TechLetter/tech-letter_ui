import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookmarksApi from "../api/bookmarksApi";
import PostCard from "../components/PostCard";
import { PATHS } from "../routes/path";
import { useAuth } from "../provider/AuthProvider";
import { mergeUniqueByKey } from "../utils/arrayUtils";

const PAGE_SIZE = 12;

export default function Bookmarks() {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      navigate(PATHS.LOGIN, { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const response = await bookmarksApi.getBookmarks({
          page,
          page_size: PAGE_SIZE,
        });
        const data = response.data;
        const items = data?.data || [];

        if (items.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setPosts((prev) => mergeUniqueByKey(prev, items, "id"));
      } catch (error) {
        console.error("Failed to load bookmarks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [page, initialized, isAuthenticated]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const showEmptyState = !loading && posts.length === 0;

  return (
    <div className="w-full max-w-full sm:max-w-2xl lg:max-w-7xl mx-auto min-h-screen relative">
      <div className="flex flex-col items-center mt-3 mb-6">
        <p className="text-xs sm:text-sm text-gray-500">
          관심 있는 글을 북마크해 한 번에 모아볼 수 있어요.
        </p>
      </div>

      {showEmptyState && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-sm">
          <p className="mb-2 font-medium">아직 저장한 북마크가 없어요.</p>
          <p className="text-xs">
            관심 있는 글 우측 상단의 북마크 아이콘을 눌러 저장해 보세요.
          </p>
        </div>
      )}

      {!showEmptyState && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post_id={post.id}
              blogName={post.blog_name}
              postTitle={post.title}
              postSummary={post.summary}
              postTags={post.tags}
              postThumbnailUrl={post.thumbnail_url}
              postUrl={post.link}
              postPublishedAt={post.published_at}
              postViewCount={post.view_count}
              isBookmarked={true}
            />
          ))}
        </div>
      )}

      {hasMore && !showEmptyState && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}

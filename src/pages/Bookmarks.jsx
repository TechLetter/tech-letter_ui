import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookmarksApi from "../api/bookmarksApi";
import PostCard from "../components/PostCard";
import { PATHS } from "../routes/path";
import { useAuth } from "../hooks/useAuth";
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
        const { items = [], page: current, total_pages } = response.data;
        setHasMore(current < total_pages);
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
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-ink lg:text-2xl">북마크</h1>

      {showEmptyState && (
        <p className="rounded-xl border border-dashed border-line px-3 py-16 text-center text-sm text-ink-3">
          저장한 글 없음
        </p>
      )}

      {!showEmptyState && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post_id={post.id}
              blogId={post.blog_id}
              blogName={post.blog_name}
              postTitle={post.title}
              postSummary={post.summary}
              postTags={post.tags}
              postThumbnailUrl={post.thumbnail_url}
              postUrl={post.link}
              postPublishedAt={post.published_at}
              postViewCount={post.view_count}
              isBookmarked={true}
              onSelectBlog={(blogId) => navigate(`${PATHS.HOME}?blog=${encodeURIComponent(blogId)}`)}
            />
          ))}
        </div>
      )}

      {hasMore && !showEmptyState && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="h-10 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink-2 hover:bg-canvas disabled:opacity-60"
          >
            {loading ? "불러오는 중" : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}

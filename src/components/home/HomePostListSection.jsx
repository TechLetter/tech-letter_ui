import PostCard from "../PostCard";

export default function HomePostListSection({ posts, loading, hasMore, onSelectBlog, onClearFilters }) {
  const empty = !loading && posts.length === 0;

  return (
    <div className="pb-4">
      {empty && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line py-16">
          <p className="text-sm text-ink-3">조건에 맞는 글 없음</p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-9 rounded-lg border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-2 hover:bg-canvas"
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

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
            isBookmarked={post.is_bookmarked}
            onSelectBlog={onSelectBlog}
          />
        ))}
      </div>

      {loading && (
        <div className="my-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="my-8 text-center text-sm text-ink-3">모든 글을 불러왔습니다</p>
      )}
    </div>
  );
}

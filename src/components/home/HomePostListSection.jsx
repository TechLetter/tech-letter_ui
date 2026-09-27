import { RiChat3Line } from "react-icons/ri";
import PostCard from "../PostCard";

const SKELETON_COUNT = 6;

/** 카드와 같은 골격 — 첫 화면이 비어 보이지 않게. */
function PostCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <div className="skeleton aspect-video rounded-none" />
      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4">
        <div className="flex items-center gap-2">
          <span className="skeleton h-5 w-5 rounded-md" />
          <span className="skeleton h-3 w-28" />
          <span className="skeleton ml-auto h-3 w-16" />
        </div>
        <span className="skeleton h-4 w-[92%]" />
        <span className="skeleton h-4 w-[70%]" />
        <span className="skeleton h-3 w-full" />
        <span className="skeleton h-3 w-[85%]" />
        <div className="flex gap-1.5">
          <span className="skeleton h-5 w-14 rounded-md" />
          <span className="skeleton h-5 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function HomePostListSection({
  posts,
  loading,
  hasMore,
  onSelectBlog,
  onClearFilters,
  searchQuery = "",
  highlightTerms = [],
  onAskChatbot,
}) {
  const empty = !loading && posts.length === 0;
  const initialLoading = loading && posts.length === 0;

  return (
    <div className="pb-4">
      {empty && searchQuery && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line py-16">
          <p className="text-sm text-ink-3">
            ‘{searchQuery}’ <span className="font-mono">(0)</span>
          </p>
          <button
            type="button"
            onClick={onAskChatbot}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-accent-fg hover:opacity-90"
          >
            <RiChat3Line className="h-4 w-4" />
            챗봇에 물어보기
          </button>
        </div>
      )}

      {empty && !searchQuery && (
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3" aria-busy={loading}>
        {initialLoading && Array.from({ length: SKELETON_COUNT }).map((_, index) => <PostCardSkeleton key={index} />)}
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
            highlightTerms={highlightTerms}
          />
        ))}
      </div>

      {loading && !initialLoading && (
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

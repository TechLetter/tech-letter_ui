import React from "react";
import PostCard from "../PostCard";

export default function HomePostListSection({ posts, loading, hasMore }) {
  return (
    <>
      {/* 포스트 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {posts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post_id={post.id}
            blogName={post.blog_name}
            postTitle={post.title}
            postSummary={post.summary}
            postTags={post.tags}
            postThumbnailUrl={post.thumbnail_url}
            postUrl={post.link}
            postPublishedAt={post.published_at}
            postViewCount={post.view_count}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center my-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      )}
      {!hasMore && (
        <div className="text-center my-8 text-gray-500 font-medium">
          모든 포스트를 불러왔습니다
        </div>
      )}
    </>
  );
}

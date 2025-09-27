import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

const PAGE_SIZE = 10;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/v1/posts?page=${pageNum}&page_size=${PAGE_SIZE}`
      );
      const data = await res.json();
      if (data.data.length < PAGE_SIZE) setHasMore(false);
      setPosts((prev) => [...prev, ...data.data]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

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
    <div className="flex flex-col items-center gap-[16px]">
      {posts.map((post, index) => (
        <PostCard
          key={`${post.id}-${index}`}
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

      {loading && <div className="text-center my-4">Loading...</div>}
      {!hasMore && (
        <div className="text-center my-4 text-gray-500">No more posts</div>
      )}
    </div>
  );
}

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
    <div className="w-[420px] mx-auto bg-gray-50 min-h-screen relative">
      {/* 헤더 */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[420px] h-[84px] bg-white flex items-center justify-between px-4 shadow">
        <div className="text-2xl font-bold font-sans">Tech Feed</div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </header>

      {/* 포스트 리스트 */}
      <main className="pt-[100px] pb-[100px] px-4 flex flex-col gap-[12px]">
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
      </main>

      {/* 푸터 */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[84px] bg-white flex justify-around items-center border-t border-gray-300">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </footer>
    </div>
  );
}

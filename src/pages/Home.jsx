import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const PAGE_SIZE = 10;
const CATEGORIES = [
  "Backend",
  "Frontend",
  "Mobile",
  "AI",
  "Data Engineering",
  "DevOps",
  "Security",
  "Cloud",
  "Database",
  "Programming Languages",
  "Infrastructure",
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const fetchPosts = async (pageNum = 1, resetPosts = false) => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory
        ? `&categories=${selectedCategory}`
        : "";
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/v1/posts?page=${pageNum}&page_size=${PAGE_SIZE}${categoryParam}`
      );
      const data = await res.json();
      if (data.data.length < PAGE_SIZE) setHasMore(false);

      if (resetPosts) {
        setPosts(data.data);
      } else {
        setPosts((prev) => [...prev, ...data.data]);
      }
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
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [selectedCategory]);

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
    <div className="flex flex-col items-center gap-4">
      {/* 카테고리 필터 */}
      <div className="w-full relative flex justify-center">
        <button
          onClick={() => setCategoryOpen((prev) => !prev)}
          className="w-[348px] flex items-center justify-between px-[12px] py-[8px]
     border border-gray-300 rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
        >
          <span className="text-gray-800 font-medium">
            {selectedCategory || "카테고리 선택"}
          </span>
          {categoryOpen ? (
            <IoChevronUp size={20} />
          ) : (
            <IoChevronDown size={20} />
          )}
        </button>

        {categoryOpen && (
          <div
            className="absolute top-full mt-2 z-20 w-[360px] left-1/2 -translate-x-1/2
       grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-gray-200
       rounded-2xl bg-white shadow-lg animate-fadeIn"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? "outline outline-[#1E3A8A] shadow-md"
                    : ""
                }`}
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedCategory("");
                setCategoryOpen(false);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 transition bg-gray-100 hover:bg-gray-200"
            >
              None
            </button>
          </div>
        )}
      </div>

      {/* 포스트 리스트 */}
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

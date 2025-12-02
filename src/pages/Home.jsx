import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import postsApi from "../api/postsApi";
import blogsApi from "../api/blogsApi";

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
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [blogOpen, setBlogOpen] = useState(false);

  const fetchPosts = async (pageNum = 1, resetPosts = false) => {
    setLoading(true);
    try {
      const res = await postsApi.getPosts({
        page: pageNum,
        page_size: PAGE_SIZE,
        categories: selectedCategory,
        blog_id: selectedBlogId,
      });
      const data = res.data;

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
    const loadBlogs = async () => {
      try {
        const res = await blogsApi.getBlogs({ page: 1, page_size: 100 });
        setBlogs(res.data.data);
      } catch (err) {
        console.log("Failed to fetch blogs:", err);
      }
    };
    loadBlogs();
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [selectedCategory, selectedBlogId]);

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
      {/* 필터 영역 - 카테고리 & 블로그 */}
      <div className="w-full relative flex flex-col items-center gap-2">
        {/* 필터 버튼들 */}
        <div className="flex gap-2">
          {/* 카테고리 필터 */}
          <button
            onClick={() => {
              setCategoryOpen((prev) => !prev);
              setBlogOpen(false);
            }}
            className="w-[170px] flex items-center justify-between px-[12px] py-[8px]
       border border-gray-300 rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
          >
            <span className="text-gray-800 font-medium text-sm truncate">
              {selectedCategory || "카테고리"}
            </span>
            {categoryOpen ? (
              <IoChevronUp size={18} />
            ) : (
              <IoChevronDown size={18} />
            )}
          </button>

          {/* 블로그 필터 */}
          <button
            onClick={() => {
              setBlogOpen((prev) => !prev);
              setCategoryOpen(false);
            }}
            className="w-[170px] flex items-center justify-between px-[12px] py-[8px]
       border border-gray-300 rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
          >
            <span className="text-gray-800 font-medium text-sm truncate">
              {blogs.find((b) => b.id === selectedBlogId)?.name || "블로그"}
            </span>
            {blogOpen ? (
              <IoChevronUp size={18} />
            ) : (
              <IoChevronDown size={18} />
            )}
          </button>
        </div>

        {/* 카테고리 드롭다운 */}
        {categoryOpen && (
          <div
            className="absolute top-full mt-2 z-20 w-[360px] left-1/2 -translate-x-1/2
       grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-gray-200
       rounded-2xl bg-white shadow-lg animate-fadeIn"
          >
            <button
              onClick={() => {
                setSelectedCategory("");
                setCategoryOpen(false);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 transition bg-gray-100 hover:bg-gray-200"
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-200 ${selectedCategory === category
                    ? "outline outline-[#1E3A8A] shadow-md"
                    : ""
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* 블로그 드롭다운 */}
        {blogOpen && (
          <div
            className="absolute top-full mt-2 z-20 w-[360px] left-1/2 -translate-x-1/2
       max-h-[400px] overflow-y-auto p-4 border border-gray-200
       rounded-2xl bg-white shadow-lg animate-fadeIn"
          >
            <button
              onClick={() => {
                setSelectedBlogId("");
                setBlogOpen(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-400 transition bg-gray-100 hover:bg-gray-200 mb-2"
            >
              All
            </button>
            {blogs.map((blog) => (
              <button
                key={blog.id}
                onClick={() => {
                  setSelectedBlogId(blog.id);
                  setBlogOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-200 mb-2 text-left ${selectedBlogId === blog.id
                    ? "outline outline-[#1E3A8A] shadow-md"
                    : ""
                  }`}
              >
                {blog.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 포스트 리스트 */}
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

      {loading && <div className="text-center my-4">Loading...</div>}
      {!hasMore && (
        <div className="text-center my-4 text-gray-500">No more posts</div>
      )}
    </div>
  );
}

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
    <div className="w-full">
      {/* 필터 영역 - 카테고리 & 블로그 */}
      <div className="w-full relative flex flex-col items-center gap-3 mb-4">
        {/* 필터 버튼들 */}
        <div className="flex gap-3">
          {/* 카테고리 필터 */}
          <button
            onClick={() => {
              setCategoryOpen((prev) => !prev);
              setBlogOpen(false);
            }}
            className="w-40 sm:w-48 flex items-center justify-between px-4 py-2.5
       border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 
       shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            <span className="text-gray-800 font-semibold text-sm truncate">
              {selectedCategory || "카테고리"}
            </span>
            {categoryOpen ? (
              <IoChevronUp size={20} className="text-gray-600" />
            ) : (
              <IoChevronDown size={20} className="text-gray-600" />
            )}
          </button>

          {/* 블로그 필터 */}
          <button
            onClick={() => {
              setBlogOpen((prev) => !prev);
              setCategoryOpen(false);
            }}
            className="w-40 sm:w-48 flex items-center justify-between px-4 py-2.5
       border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 
       shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            <span className="text-gray-800 font-semibold text-sm truncate">
              {blogs.find((b) => b.id === selectedBlogId)?.name || "블로그"}
            </span>
            {blogOpen ? (
              <IoChevronUp size={20} className="text-gray-600" />
            ) : (
              <IoChevronDown size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* 카테고리 드롭다운 */}
        {categoryOpen && (
          <div
            className="absolute top-full mt-2 z-20 w-[90vw] max-w-md sm:max-w-lg left-1/2 -translate-x-1/2
       grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-4 border border-gray-200
       rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn"
          >
            <button
              onClick={() => {
                setSelectedCategory("");
                setCategoryOpen(false);
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all 
              bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${selectedCategory === category
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
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
            className="absolute top-full mt-2 z-20 w-[90vw] max-w-md sm:max-w-lg left-1/2 -translate-x-1/2
       max-h-96 overflow-y-auto p-4 border border-gray-200
       rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn
       grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <button
              onClick={() => {
                setSelectedBlogId("");
                setBlogOpen(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all 
              bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
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
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] text-left ${selectedBlogId === blog.id
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
              >
                {blog.name}
              </button>
            ))}
          </div>
        )}
      </div>

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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      {!hasMore && (
        <div className="text-center my-8 text-gray-500 font-medium">
          모든 포스트를 불러왔습니다
        </div>
      )}
    </div>
  );
}

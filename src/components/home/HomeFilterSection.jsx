import React, { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function HomeFilterSection({
  categoryFilters,
  blogFilters,
  tagFilters,
  selectedCategory,
  selectedBlogId,
  selectedTags,
  onChangeCategory,
  onChangeBlog,
  onChangeTags,
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const handleCategoryButtonClick = () => {
    setCategoryOpen((prev) => !prev);
    setBlogOpen(false);
    setTagOpen(false);
  };

  const handleBlogButtonClick = () => {
    setBlogOpen((prev) => !prev);
    setCategoryOpen(false);
    setTagOpen(false);
  };

  const handleTagButtonClick = () => {
    setTagOpen((prev) => !prev);
    setCategoryOpen(false);
    setBlogOpen(false);
  };

  const handleSelectAllCategory = () => {
    onChangeCategory("");
    setCategoryOpen(false);
  };

  const handleSelectCategory = (categoryName) => {
    onChangeCategory(categoryName);
    setCategoryOpen(false);
  };

  const handleSelectAllBlog = () => {
    onChangeBlog("");
    setBlogOpen(false);
  };

  const handleSelectBlog = (blogId) => {
    onChangeBlog(blogId);
    setBlogOpen(false);
  };

  const handleSelectAllTags = () => {
    onChangeTags([]);
    setTagOpen(false);
  };

  const handleToggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onChangeTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      onChangeTags([...selectedTags, tagName]);
    }
    setTagOpen(false);
  };

  return (
    <div className="w-full relative flex flex-col items-center gap-3 mb-4">
      {/* 필터 영역 - 카테고리 & 블로그 */}
      {/* 필터 버튼들 */}
      <div className="flex gap-2 sm:gap-3">
        {/* 카테고리 필터 */}
        <button
          onClick={handleCategoryButtonClick}
          className="w-28 sm:w-36 md:w-40 flex items-center justify-between px-3 py-2.5
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
          onClick={handleBlogButtonClick}
          className="w-28 sm:w-36 md:w-40 flex items-center justify-between px-3 py-2.5
       border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 
       shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
        >
          <span className="text-gray-800 font-semibold text-sm truncate">
            {blogFilters.find((blog) => blog.id === selectedBlogId)?.name ||
              "블로그"}
          </span>
          {blogOpen ? (
            <IoChevronUp size={20} className="text-gray-600" />
          ) : (
            <IoChevronDown size={20} className="text-gray-600" />
          )}
        </button>

        {/* 태그 필터 */}
        <button
          onClick={handleTagButtonClick}
          className="w-28 sm:w-36 md:w-40 flex items-center justify-between px-3 py-2.5
       border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 
       shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
        >
          <span className="text-gray-800 font-semibold text-sm truncate">
            {selectedTags.length > 0 ? `태그 (${selectedTags.length})` : "태그"}
          </span>
          {tagOpen ? (
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
        border border-gray-200 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn"
        >
          <div className="max-h-96 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-2 overflow-y-auto">
            <button
              onClick={handleSelectAllCategory}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all 
                bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
            >
              All
            </button>
            {categoryFilters.map((category) => (
              <button
                key={category.name}
                onClick={() => handleSelectCategory(category.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  selectedCategory === category.name
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {category.name}{" "}
                <span className="text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 블로그 드롭다운 */}
      {blogOpen && (
        <div
          className="absolute top-full mt-2 z-20 w-[90vw] max-w-md sm:max-w-lg left-1/2 -translate-x-1/2
        border border-gray-200 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn"
        >
          <div className="max-h-96 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 overflow-y-auto">
            <button
              onClick={handleSelectAllBlog}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all 
              bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
            >
              All
            </button>
            {blogFilters.map((blog) => (
              <button
                key={blog.id}
                onClick={() => handleSelectBlog(blog.id)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] text-left ${
                  selectedBlogId === blog.id
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {blog.name}{" "}
                <span className="text-xs opacity-75">({blog.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 태그 드롭다운 */}
      {tagOpen && (
        <div
          className="absolute top-full mt-2 z-20 w-[90vw] max-w-md sm:max-w-lg left-1/2 -translate-x-1/2
        border border-gray-200 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn"
        >
          <div className=" max-h-96 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 p-2 gap-2 overflow-y-auto">
            <button
              onClick={handleSelectAllTags}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all 
              bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
            >
              All
            </button>
            {tagFilters.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleToggleTag(tag.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 
                      ${
                        selectedTags.includes(tag.name)
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                      } 
                      text-center overflow-hidden h-full flex items-center justify-center`}
                /* 버튼 전체에 flex를 사용하여 내부 콘텐츠 중앙 정렬 보장 */
              >
                {/* tag.name에만 말줄임표 적용 */}
                <span className="truncate whitespace-nowrap max-w-full">
                  {tag.name}
                </span>
                {/* 카운트는 그대로 표시 (줄바꿈 방지) */}
                <span className="text-xs opacity-75 whitespace-nowrap">
                  &nbsp;({tag.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

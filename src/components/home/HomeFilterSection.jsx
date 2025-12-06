import React, { useState } from "react";
import FilterToggleButton from "./FilterToggleButton";
import FilterDropdownLayout from "./FilterDropdownLayout";
import FilterAllButton from "./FilterAllButton";

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
  const [openFilter, setOpenFilter] = useState(null);

  const handleToggleFilter = (filterKey) => {
    setOpenFilter((prev) => (prev === filterKey ? null : filterKey));
  };

  const handleSelectAllCategory = () => {
    onChangeCategory("");
    setOpenFilter(null);
  };

  const handleSelectCategory = (categoryName) => {
    onChangeCategory(categoryName);
    setOpenFilter(null);
  };

  const handleSelectAllBlog = () => {
    onChangeBlog("");
    setOpenFilter(null);
  };

  const handleSelectBlog = (blogId) => {
    onChangeBlog(blogId);
    setOpenFilter(null);
  };

  const handleSelectAllTags = () => {
    onChangeTags([]);
    setOpenFilter(null);
  };

  const handleToggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onChangeTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      onChangeTags([...selectedTags, tagName]);
    }
    setOpenFilter(null);
  };

  return (
    <div className="relative mb-6 w-full">
      {/* 필터 영역 - 카테고리 & 블로그 */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        {/* 필터 버튼들 */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* 블로그 필터 */}
          <FilterToggleButton
            label={
              blogFilters.find((blog) => blog.id === selectedBlogId)?.name ||
              "블로그"
            }
            isOpen={openFilter === "blog"}
            onClick={() => handleToggleFilter("blog")}
          />

          {/* 카테고리 필터 */}
          <FilterToggleButton
            label={selectedCategory || "카테고리"}
            isOpen={openFilter === "category"}
            onClick={() => handleToggleFilter("category")}
          />

          {/* 태그 필터 */}
          <FilterToggleButton
            label={
              selectedTags.length > 0 ? `태그 (${selectedTags.length})` : "태그"
            }
            isOpen={openFilter === "tag"}
            onClick={() => handleToggleFilter("tag")}
          />
        </div>
      </div>

      {/* 블로그 드롭다운 */}
      {openFilter === "blog" && (
        <FilterDropdownLayout gridClassName="max-h-96 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 overflow-y-auto">
          <FilterAllButton onClick={handleSelectAllBlog} fullWidth />
          {blogFilters.map((blog) => (
            <button
              key={blog.id}
              onClick={() => handleSelectBlog(blog.id)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] text-left ${
                selectedBlogId === blog.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              {blog.name}{" "}
              <span className="text-xs opacity-75">({blog.count})</span>
            </button>
          ))}
        </FilterDropdownLayout>
      )}

      {/* 카테고리 드롭다운 */}
      {openFilter === "category" && (
        <FilterDropdownLayout gridClassName="max-h-96 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-2 overflow-y-auto">
          <FilterAllButton onClick={handleSelectAllCategory} />
          {categoryFilters.map((category) => (
            <button
              key={category.name}
              onClick={() => handleSelectCategory(category.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                selectedCategory === category.name
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              {category.name}{" "}
              <span className="text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </FilterDropdownLayout>
      )}

      {/* 태그 드롭다운 */}
      {openFilter === "tag" && (
        <FilterDropdownLayout gridClassName=" max-h-96 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 p-2 gap-2 overflow-y-auto">
          <FilterAllButton onClick={handleSelectAllTags} fullWidth />
          {tagFilters.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleToggleTag(tag.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 
                      ${
                        selectedTags.includes(tag.name)
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600"
                          : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                      } 
                      text-center overflow-hidden h-full flex items-center justify-center`}
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
        </FilterDropdownLayout>
      )}
    </div>
  );
}

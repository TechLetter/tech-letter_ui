import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RiCloseLine } from "react-icons/ri";
import { createPost, getBlogs, handleAdminError } from "../../../api/adminApi";
import { showToast } from "../../../provider/ToastModalProvider";

export default function CreatePostModal({ open, onClose, onCreated }) {
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(""); // 인라인 에러 메시지

  const [formData, setFormData] = useState({
    blog_id: "",
    title: "",
    link: "",
  });

  // 블로그 목록 로드
  useEffect(() => {
    if (open && blogs.length === 0) {
      loadBlogs();
    }
  }, [open]);

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      setFormData({ blog_id: "", title: "", link: "" });
      setError("");
    }
  }, [open]);

  const loadBlogs = async () => {
    setBlogsLoading(true);
    try {
      const data = await getBlogs({ page: 1, page_size: 100 });
      setBlogs(data.data || []);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // 입력 시 에러 초기화
  };

  // URL에서 도메인 추출
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!formData.blog_id) {
      setError("블로그를 선택해주세요.");
      return;
    }
    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!formData.link.trim()) {
      setError("링크를 입력해주세요.");
      return;
    }

    // 도메인 일치 검사
    const selectedBlog = blogs.find((b) => b.id === formData.blog_id);
    if (selectedBlog) {
      const blogDomain = getDomain(selectedBlog.url);
      const linkDomain = getDomain(formData.link.trim());

      if (!linkDomain) {
        setError("유효한 링크 URL을 입력해주세요.");
        return;
      }

      if (blogDomain && linkDomain && blogDomain !== linkDomain) {
        setError(
          `링크 도메인(${linkDomain})이 블로그 도메인(${blogDomain})과 일치하지 않습니다.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await createPost({
        blog_id: formData.blog_id,
        title: formData.title.trim(),
        link: formData.link.trim(),
      });
      showToast(
        "포스트가 생성되었습니다. AI 요약이 자동으로 시작됩니다.",
        "success"
      );
      onCreated?.();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">포스트 추가</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* 블로그 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              블로그 <span className="text-red-500">*</span>
            </label>
            <select
              name="blog_id"
              value={formData.blog_id}
              onChange={handleChange}
              disabled={blogsLoading}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50"
            >
              <option value="">
                {blogsLoading ? "로딩 중..." : "블로그를 선택하세요"}
              </option>
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.name} ({blog.url})
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="포스트 제목을 입력하세요"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 링크 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              링크 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com/post"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreatePostModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};

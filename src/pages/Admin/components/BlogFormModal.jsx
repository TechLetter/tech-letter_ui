import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { RiCloseLine } from "react-icons/ri";

const DEFAULT_FORM = {
  name: "",
  url: "",
  rss_url: "",
  blog_type: "company",
  is_active: true,
};

const BLOG_TYPE_OPTIONS = [
  { value: "company", label: "회사" },
  { value: "creator", label: "개인/크리에이터" },
];

const BLOG_TYPE_VALUES = new Set(BLOG_TYPE_OPTIONS.map((option) => option.value));

function normalizeUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

function getBlogTypeValue(value) {
  return BLOG_TYPE_VALUES.has(value) ? value : "company";
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export default function BlogFormModal({
  open,
  mode,
  blog,
  existingBlogs,
  submitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");

  const title = mode === "edit" ? "블로그 수정" : "블로그 추가";
  const submitLabel = mode === "edit" ? "수정" : "추가";

  const duplicateCandidates = useMemo(
    () => existingBlogs.filter((item) => item.id !== blog?.id),
    [blog?.id, existingBlogs]
  );

  useEffect(() => {
    if (!open) return;

    setFormData({
      name: blog?.name || "",
      url: blog?.url || "",
      rss_url: blog?.rss_url || "",
      blog_type: getBlogTypeValue(blog?.blog_type),
      is_active: blog?.is_active ?? true,
    });
    setError("");
  }, [blog, open]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const validate = () => {
    if (!formData.name.trim()) return "블로그명을 입력해주세요.";
    if (!formData.url.trim()) return "블로그 URL을 입력해주세요.";
    if (!formData.rss_url.trim()) return "RSS URL을 입력해주세요.";
    if (!isValidUrl(formData.url.trim())) return "유효한 블로그 URL을 입력해주세요.";
    if (!isValidUrl(formData.rss_url.trim())) return "유효한 RSS URL을 입력해주세요.";
    if (!BLOG_TYPE_VALUES.has(formData.blog_type)) {
      return "블로그 유형은 회사 또는 개인/크리에이터만 선택할 수 있습니다.";
    }

    const normalizedUrl = normalizeUrl(formData.url);
    const normalizedRssUrl = normalizeUrl(formData.rss_url);
    const duplicatedUrl = duplicateCandidates.some(
      (item) => normalizeUrl(item.url || "") === normalizedUrl
    );
    const duplicatedRssUrl = duplicateCandidates.some(
      (item) => normalizeUrl(item.rss_url || "") === normalizedRssUrl
    );

    if (duplicatedRssUrl) return "이미 등록된 RSS URL입니다.";
    if (duplicatedUrl) return "이미 등록된 블로그 URL입니다.";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      url: formData.url.trim(),
      rss_url: formData.rss_url.trim(),
      blog_type: getBlogTypeValue(formData.blog_type),
      is_active: formData.is_active,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800 dark:shadow-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              블로그명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              블로그 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com/blog"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              RSS URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="rss_url"
              value={formData.rss_url}
              onChange={handleChange}
              placeholder="https://example.com/feed.xml"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              유형
            </label>
            <select
              name="blog_type"
              value={formData.blog_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {BLOG_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            수집 활성화
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {submitting ? "저장 중..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

BlogFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  blog: PropTypes.object,
  existingBlogs: PropTypes.arrayOf(PropTypes.object).isRequired,
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

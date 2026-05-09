import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { RiCloseLine } from "react-icons/ri";

export default function DeleteBlogModal({
  open,
  blog,
  submitting,
  onClose,
  onConfirm,
}) {
  const [deletePosts, setDeletePosts] = useState(false);

  useEffect(() => {
    if (open) setDeletePosts(false);
  }, [open, blog?.id]);

  if (!open || !blog) return null;

  const postCount = blog.post_count || 0;

  const handleConfirm = () => {
    onConfirm({ delete_posts: deletePosts });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800 dark:shadow-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            블로그 삭제
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/40">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {blog.name}
            </div>
            <div className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
              {blog.rss_url}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              포스트 {postCount.toLocaleString()}개
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={deletePosts}
              onChange={(event) => setDeletePosts(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span>
              이 블로그의 모든 포스트도 함께 삭제
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                선택하면 포스트 {postCount.toLocaleString()}개가 함께 삭제됩니다.
                선택하지 않으면 블로그 수집 대상만 삭제되고 기존 포스트는 유지됩니다.
              </span>
            </span>
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
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteBlogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  blog: PropTypes.object,
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

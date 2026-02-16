import { useState } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useAuth } from "../../hooks/useAuth";
import bookmarksApi from "../../api/bookmarksApi";
import { showToast } from "../../provider/toastModalBridge";
import { showLoginRequiredModal } from "../../provider/loginRequiredModalBridge";

export default function BookmarkToggleButton({
  postId,
  initialIsBookmarked = false,
}) {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggleBookmark = async (event) => {
    event.stopPropagation();
    if (loading) return;

    if (!isAuthenticated) {
      showLoginRequiredModal();
      return;
    }

    const nextValue = !isBookmarked;
    setIsBookmarked(nextValue);
    setLoading(true);

    try {
      if (nextValue) {
        await bookmarksApi.addBookmark(postId);
        showToast("북마크에 추가되었습니다.");
      } else {
        await bookmarksApi.removeBookmark(postId);
        showToast("북마크에서 제거되었습니다.");
      }
    } catch {
      setIsBookmarked(!nextValue);
      showToast(
        "북마크 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  const Icon = isBookmarked ? BsBookmarkFill : BsBookmark;

  return (
    <button
      type="button"
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
        isBookmarked
          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      } ${loading ? "opacity-60" : ""}`}
    >
      <Icon size={18} />
    </button>
  );
}

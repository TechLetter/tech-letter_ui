import timeutils from "../utils/timeutils";
import { GrView } from "react-icons/gr";
import { IoShareSocialOutline } from "react-icons/io5";
import { showToast } from "../provider/ToastModalProvider";
import postsApi from "../api/postsApi";
import BookmarkToggleButton from "./bookmark/BookmarkToggleButton";

export default function PostCard({
  post_id,
  blogName,
  postTitle,
  postSummary,
  postTags,
  postThumbnailUrl,
  postUrl,
  postPublishedAt,
  postViewCount = 0,
  isBookmarked = false,
}) {
  const handleClickView = () => {
    postsApi.incrementViewCount(post_id);
    window.open(postUrl, "_blank");
  };

  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      textArea.style.position = "fixed";
      textArea.style.opacity = 0;

      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-300/80 hover:shadow-md">
      {/* 썸네일 이미지 */}
      <div className="relative h-32 sm:h-40 md:h-40 overflow-hidden">
        {postThumbnailUrl ? (
          <img
            src={postThumbnailUrl}
            alt={postTitle}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start px-3 pt-3">
          <div className="pointer-events-auto inline-flex max-w-[70%] items-center rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-indigo-50 backdrop-blur">
            <span className="truncate">{blogName}</span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* 포스트 정보 */}
      <div
        className="flex h-full cursor-pointer flex-col justify-between gap-2 px-4 py-3 text-left"
        onClick={handleClickView}
      >
        {/* 상단: 제목 + 본문 요약 */}
        <div className="flex flex-col gap-4 text-slate-900">
          <h2 className="text-lg sm:text-xl font-semibold leading-snug line-clamp-2">
            {postTitle}
          </h2>
          <p className="text-sm text-slate-700 sm:text-base">{postSummary}</p>
        </div>

        {/* 하단: 태그 + 메타 정보 */}
        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:text-sm">
          <div className="flex flex-wrap gap-1.5">
            {postTags?.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={`${tag}-${tagIndex}`}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-[3px] text-[11px] text-indigo-700"
              >
                {tag}
              </span>
            ))}
            {postTags && postTags.length > 3 && (
              <span className="text-[11px] text-indigo-300">
                +{postTags.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-3">
              <span>{timeutils.formatLocalDate(postPublishedAt)}</span>
            </div>

            <div className="flex flex-row items-center gap-3">
              <span className="flex flex-row items-center justify-center gap-1.5">
                <GrView size={16} />
                {postViewCount}
              </span>
              <button
                className="flex flex-row items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard(postUrl);
                  showToast("URL이 클립보드에 복사되었습니다.");
                }}
              >
                <IoShareSocialOutline size={18} />
              </button>
              <BookmarkToggleButton
                postId={post_id}
                initialIsBookmarked={isBookmarked}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

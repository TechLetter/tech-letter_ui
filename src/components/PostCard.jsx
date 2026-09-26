import timeutils from "../utils/timeutils";
import { GrView } from "react-icons/gr";
import { IoShareSocialOutline } from "react-icons/io5";
import { showToast } from "../provider/toastModalBridge";
import postsApi from "../api/postsApi";
import BookmarkToggleButton from "./bookmark/BookmarkToggleButton";
import BlogIcon from "./common/BlogIcon";

const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = 0;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export default function PostCard({
  post_id,
  blogId,
  blogName,
  postTitle,
  postSummary,
  postTags,
  postThumbnailUrl,
  postUrl,
  postPublishedAt,
  postViewCount = 0,
  isBookmarked = false,
  onSelectBlog,
}) {
  // 원문은 새 탭에서 연다. 조회수는 열 때 올린다.
  const handleOpen = () => {
    postsApi.incrementViewCount(post_id);
  };

  const blogNameClass = "min-w-0 truncate text-[13px] font-semibold text-ink-2";

  return (
    <article
      data-testid="post-card"
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-slate-300 dark:hover:border-slate-500"
    >
      <a
        href={postUrl}
        target="_blank"
        rel="noreferrer"
        onClick={handleOpen}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-video overflow-hidden bg-canvas"
      >
        {postThumbnailUrl ? (
          <img
            src={postThumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <BlogIcon blogId={blogId} name={blogName} size={44} />
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2">
          <BlogIcon blogId={blogId} name={blogName} size={20} />
          {onSelectBlog ? (
            <button
              type="button"
              onClick={() => onSelectBlog(blogId)}
              className={`${blogNameClass} hover:text-accent-ink`}
            >
              {blogName}
            </button>
          ) : (
            <span className={blogNameClass}>{blogName}</span>
          )}
          <span className="ml-auto shrink-0 font-mono text-xs text-ink-3">
            {timeutils.formatLocalDate(postPublishedAt)}
          </span>
        </div>

        <h2 className="line-clamp-2 text-[17px] leading-snug font-semibold tracking-tight text-ink">
          <a href={postUrl} target="_blank" rel="noreferrer" onClick={handleOpen} className="hover:text-accent-ink">
            {postTitle}
          </a>
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-2">{postSummary}</p>

        {postTags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {postTags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={`${tag}-${tagIndex}`}
                className="rounded-md bg-canvas px-2 py-[3px] text-xs text-ink-2"
              >
                {tag}
              </span>
            ))}
            {postTags.length > 3 && (
              <span className="font-mono text-xs text-ink-3">+{postTags.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-0.5 pt-1">
          <span className="flex items-center gap-1.5 font-mono text-xs text-ink-3">
            <GrView size={14} />
            {postViewCount}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            aria-label="링크 복사"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
            onClick={() => {
              copyToClipboard(postUrl);
              showToast("URL이 클립보드에 복사되었습니다.");
            }}
          >
            <IoShareSocialOutline size={18} />
          </button>
          <BookmarkToggleButton postId={post_id} initialIsBookmarked={isBookmarked} />
        </div>
      </div>
    </article>
  );
}

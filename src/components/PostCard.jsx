import timeutils from "../utils/timeutils";
import { GrView } from "react-icons/gr";
import { IoShareSocialOutline } from "react-icons/io5";
import { showModal } from "../provider/ModalProvider";
import postsApi from "../api/postsApi";

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
}) {

  const handleClickView = () => {
    postsApi.incrementViewCount(post_id);
    window.open(postUrl, "_blank");
  };


  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      textArea.style.position = 'fixed';
      textArea.style.opacity = 0;

      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative w-full">
      {/* 썸네일 백그라운드 */}
      {postThumbnailUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${postThumbnailUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black"></div>
      )}

      {/* 포스트 정보 */}
      <div
        className="relative z-1 p-[12px] cursor-pointer flex flex-col justify-between gap-[12px] h-full"
        onClick={handleClickView}
      >
        <div className="flex flex-col gap-[8px] text-white">
          <h3 className="text-[16px] font-bold">{blogName}</h3>
          <h2 className="text-[20px] font-bold font-sans line-clamp-2">
            {postTitle}
          </h2>
        </div>

        <div className="flex flex-col justify-end text-white">
          <span className="text-sm line-clamp-7">
            {postSummary}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {postTags?.map((tag, tagIndex) => (
            <span
              key={`${tag}-${tagIndex}`}
              className="text-[11px] bg-white/20 px-[4px] py-[2px] rounded text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-row justify-between text-gray-300">
          <div className="flex flex-row gap-[12px] text-[14px]">
            <span>{timeutils.formatLocalDate(postPublishedAt)}</span>
            {/* <span>{timeutils.timeDifferenceFromNow(postPublishedAt)}</span> */}
          </div>

          <div className="flex flex-row gap-[12px]">
            <span className="flex flex-row items-center justify-center gap-[6px]">
              <GrView size={18} />
              {postViewCount}
            </span>
            <button
              className="flex flex-row items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyToClipboard(postUrl);
                showModal("URL이 클립보드에 복사되었습니다.");
              }}
            >
              <IoShareSocialOutline size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


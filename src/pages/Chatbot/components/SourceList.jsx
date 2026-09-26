import { RiExternalLinkLine } from "react-icons/ri";
import BlogIcon from "../../../components/common/BlogIcon";
import timeutils from "../../../utils/timeutils";

/** 답변이 참고한 글 — 번호 · 블로그 아이콘 · 제목 · 블로그. */
export default function SourceList({ sources }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-3 flex max-w-full flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-3">참고한 글 ({sources.length})</span>
      <div className="flex flex-col gap-1.5">
        {sources.map((source, index) => {
          const content = (
            <>
              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-md bg-accent-soft px-1 font-mono text-[11px] text-accent-ink">
                {index + 1}
              </span>
              <BlogIcon blogId={source.blog_id} name={source.blog_name} size={24} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold text-ink">{source.title}</span>
                <span className="truncate text-[11px] text-ink-3">
                  {source.blog_name}
                  {source.published_at && (
                    <>
                      {" · "}
                      <span className="font-mono">{timeutils.formatLocalDate(source.published_at)}</span>
                    </>
                  )}
                </span>
              </span>
              {source.link && <RiExternalLinkLine className="h-4 w-4 shrink-0 text-ink-3" />}
            </>
          );
          const className =
            "flex min-w-0 max-w-full items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 hover:border-accent";

          if (!source.link) {
            return (
              <div key={`${source.title}-${index}`} className={className}>
                {content}
              </div>
            );
          }
          return (
            <a key={`${source.link}-${index}`} href={source.link} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}

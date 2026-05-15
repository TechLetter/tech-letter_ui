import { RiExternalLinkLine, RiFileList3Line } from "react-icons/ri";

export default function SourceList({ sources }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-4 max-w-full overflow-hidden border-t border-slate-200 pt-3 dark:border-slate-800">
      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <RiFileList3Line className="text-sm" />
        참고한 글 {sources.length}개
      </div>
      <div className="space-y-1.5">
        {sources.map((source, index) => {
          const content = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{source.title}</span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {source.blog_name}
                </span>
              </span>
              {source.link && (
                <RiExternalLinkLine className="mt-0.5 flex-shrink-0 text-base" />
              )}
            </>
          );
          const className =
            "flex max-w-full min-w-0 items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

          if (!source.link) {
            return (
              <div key={`${source.title}-${index}`} className={className}>
                {content}
              </div>
            );
          }

          return (
            <a
              key={`${source.link}-${index}`}
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${className} hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-700 dark:hover:text-indigo-300`}
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}

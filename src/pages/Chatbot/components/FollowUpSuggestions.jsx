import { RiArrowRightUpLine } from "react-icons/ri";

export default function FollowUpSuggestions({ questions, onSelect }) {
  if (!questions?.length) return null;

  return (
    <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
      <div className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        이어 물어보기
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect?.(question)}
            className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
          >
            <span className="min-w-0 truncate">{question}</span>
            <RiArrowRightUpLine className="flex-shrink-0 text-sm" />
          </button>
        ))}
      </div>
    </div>
  );
}

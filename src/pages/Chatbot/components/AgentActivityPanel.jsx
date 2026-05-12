import {
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiSearchLine,
} from "react-icons/ri";
import MemoryStatusBadge from "./MemoryStatusBadge";

const activityIconByType = {
  search: RiSearchLine,
  memory: RiCheckboxCircleLine,
  rewrite: RiCheckboxCircleLine,
  verify: RiCheckboxCircleLine,
  guard: RiCheckboxCircleLine,
  answer: RiCheckboxCircleLine,
};

export default function AgentActivityPanel({ agent, memory }) {
  const activities = agent?.activities || [];
  if (!memory && activities.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
      {memory && (
        <div className="flex flex-wrap items-start gap-2">
          <MemoryStatusBadge memory={memory} />
        </div>
      )}

      {activities.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            처리 과정
          </div>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity, index) => {
              const Icon =
                activity.status === "running"
                  ? RiLoader4Line
                  : activityIconByType[activity.type] || RiCheckboxCircleLine;
              return (
                <div
                  key={`${activity.type}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <Icon
                    className={`text-sm ${
                      activity.status === "running" ? "animate-spin" : ""
                    }`}
                  />
                  <span>{activity.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

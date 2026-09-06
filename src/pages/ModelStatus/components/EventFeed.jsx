import {
  RiAddCircleLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiIndeterminateCircleLine,
} from "react-icons/ri";
import { formatKSTDateTime } from "../../../utils/timeutils";

const EVENT_META = {
  model_added: { label: "모델 추가", icon: RiAddCircleLine, tone: "text-emerald-500" },
  model_removed: { label: "모델 제거", icon: RiIndeterminateCircleLine, tone: "text-slate-400" },
  model_degraded: { label: "성능 저하", icon: RiAlertLine, tone: "text-red-500" },
  model_recovered: { label: "복구", icon: RiCheckboxCircleLine, tone: "text-emerald-500" },
};

export default function EventFeed({ events, loading }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        최근 변동 사항
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          아직 기록된 변동 사항이 없습니다.
        </p>
      ) : (
        <ul className="space-y-1 xl:max-h-[480px] xl:overflow-y-auto xl:pr-1">
          {events.map((event, index) => {
            const meta = EVENT_META[event.type] || {
              label: event.type,
              icon: RiAlertLine,
              tone: "text-slate-400",
            };
            const Icon = meta.icon;
            return (
              <li
                key={`${event.model_id}-${event.detected_at}-${index}`}
                className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <Icon className={`mt-0.5 flex-shrink-0 text-lg ${meta.tone}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <code className="truncate text-xs text-slate-700 dark:text-slate-300">
                      {event.model_id}
                    </code>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {meta.label}
                      {event.reason ? ` · ${event.reason}` : ""}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatKSTDateTime(event.detected_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

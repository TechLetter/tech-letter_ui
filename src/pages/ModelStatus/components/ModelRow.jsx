import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { classifyModelHealth } from "../../../utils/modelHealth";
import { displayName } from "../../../utils/modelName";
import { formatContext, formatLatency, formatMonth, statusDetail } from "../modelFormat";
import ModalityIcons from "./ModalityIcons";
import ScoreBar from "./ScoreBar";
import UptimeBars from "./UptimeBars";

/** `metric`(벤치마크 정렬일 때 {label, key})이 있으면 둘째 줄 끝에 그 점수 막대를 둔다. */
export default function ModelRow({ model, days, expanded, onToggle, metric }) {
  const { provider, name } = displayName(model);
  const down = model.state === "down";
  const latency = down ? null : formatLatency(model.avg_latency_ms);
  const uptime = model.uptime_30d == null ? "기록 없음" : `${model.uptime_30d}%`;
  const meta = [
    formatContext(model.info?.context_length) && `${formatContext(model.info.context_length)} ctx`,
    formatMonth(model.info?.created_at),
  ].filter(Boolean);

  return (
    <li
      className={`min-w-0 rounded-xl border bg-white shadow-sm dark:bg-slate-900 ${
        expanded
          ? "border-indigo-300 ring-1 ring-indigo-300 dark:border-indigo-500/60 dark:ring-indigo-500/60"
          : "border-slate-200 dark:border-slate-800"
      } ${down && !expanded ? "opacity-60" : ""}`}
      data-testid="model-row"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="block w-full space-y-2 rounded-xl p-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ModelStatusDot level={classifyModelHealth(model)} detail={statusDetail(model)} />
            <span className="truncate text-sm" title={model.model_id}>
              {provider && (
                <span className="text-slate-500 dark:text-slate-400">{provider} · </span>
              )}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{name}</span>
            </span>
          </div>
          <span
            className="shrink-0 text-xs tabular-nums text-slate-600 dark:text-slate-300"
            title={latency ? "응답 · 30일 가용률" : "30일 가용률"}
          >
            {latency && <span className="text-slate-500 dark:text-slate-400">{latency} · </span>}
            {uptime}
          </span>
        </div>
        {(model.info || metric) && (
          <div className="flex items-center gap-2 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {meta.length > 0 && <span>{meta.join(" · ")}</span>}
            <ModalityIcons modalities={model.info?.input_modalities} />
            {metric && (
              <span className="ml-auto">
                <ScoreBar label={metric.label} value={metric.key(model)} barClass="w-12 sm:w-16 flex-none" />
              </span>
            )}
          </div>
        )}
        <UptimeBars days={days} daily={model.daily} />
      </button>
    </li>
  );
}

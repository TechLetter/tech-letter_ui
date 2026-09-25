import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { classifyModelHealth } from "../../../utils/modelHealth";
import { reasonLabel, speedGrade, splitModelId } from "../modelFormat";
import UptimeBars from "./UptimeBars";

const SPEED = {
  fast: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  normal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  slow: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
};

function Chip({ className, children }) {
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

export default function ModelRow({ model, days }) {
  const { provider, name } = splitModelId(model.model_id);
  const speed = model.state === "down" ? null : speedGrade(model.avg_latency_ms);

  return (
    <li
      className={`py-3.5 first:pt-0 last:pb-0 ${model.state === "down" ? "opacity-60" : ""}`}
      data-testid="model-row"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ModelStatusDot level={classifyModelHealth(model)} />
          <span className="truncate text-sm" title={model.model_id}>
            {provider && <span className="text-slate-400 dark:text-slate-500">{provider} · </span>}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{name}</span>
          </span>
          {speed && <Chip className={SPEED[speed.tone]}>{speed.label}</Chip>}
          {model.state !== "healthy" && (
            <Chip className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {reasonLabel(model.latest_status)}
            </Chip>
          )}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {model.uptime_30d == null ? "기록 없음" : `${model.uptime_30d}%`}
        </span>
      </div>
      <UptimeBars days={days} daily={model.daily} />
    </li>
  );
}

import { RiCheckLine, RiExternalLinkLine } from "react-icons/ri";
import { formatContext, formatLatency, formatMonth, plainDescription } from "../modelFormat";

const BENCHMARKS = [
  ["intelligence", "Intelligence"],
  ["coding", "Coding"],
  ["agentic", "Agentic"],
];

function Specs({ rows }) {
  return (
    <dl className="grid content-start grid-cols-[5rem_minmax(0,1fr)] gap-x-3 text-xs leading-6">
      {rows
        .filter(([, value]) => value != null && value !== "")
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="tabular-nums text-slate-700 dark:text-slate-300">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

function Flag({ on }) {
  return on ? (
    <RiCheckLine className="inline h-3.5 w-3.5" aria-label="지원" />
  ) : (
    <span className="text-slate-300 dark:text-slate-600">—</span>
  );
}

function Benchmarks({ scores }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">Artificial Analysis</p>
      {BENCHMARKS.map(([key, label]) => {
        const value = scores[key];
        return (
          <div key={key} className="flex items-center gap-2.5 text-xs">
            <span className="w-[4.5rem] text-slate-500 dark:text-slate-400">{label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
              />
            </span>
            <span className="w-8 text-right tabular-nums text-slate-700 dark:text-slate-300">
              {value ?? "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {children}
      <RiExternalLinkLine className="h-3 w-3" />
    </a>
  );
}

/** 펼친 카드의 아래쪽. 설명·링크 / 스펙·벤치마크 / 우리 헬스체크. */
export default function ModelDetail({ model }) {
  const info = model.info || {};
  const provider = [info.provider, info.quantization].filter(Boolean).join(" · ");
  const inputs = (info.input_modalities || []).join(" · ");

  return (
    <div className="grid gap-6 border-t border-slate-100 px-4 pb-4 pt-4 lg:grid-cols-3 dark:border-slate-800">
      <div className="space-y-3">
        {info.description && (
          <p className="text-[13px] leading-5 text-slate-600 dark:text-slate-300">
            {plainDescription(info.description)}
          </p>
        )}
        <div className="flex gap-4">
          {info.hugging_face_id && (
            <ExternalLink href={`https://huggingface.co/${info.hugging_face_id}`}>
              HuggingFace
            </ExternalLink>
          )}
          <ExternalLink href={`https://openrouter.ai/${model.model_id.replace(/:free$/, "")}`}>
            OpenRouter
          </ExternalLink>
        </div>
      </div>

      <div className="space-y-4">
        <Specs
          rows={[
            ["컨텍스트", formatContext(info.context_length)],
            ["출시", formatMonth(info.created_at)],
            ["입력", inputs],
            ["도구 호출", model.info && <Flag on={info.tools} />],
            ["추론", model.info && <Flag on={info.reasoning} />],
            ["제공사", provider],
          ]}
        />
        {info.benchmarks && <Benchmarks scores={info.benchmarks} />}
      </div>

      <Specs
        rows={[
          ["가용률 24h", `${model.uptime_24h}%`],
          ["가용률 30d", model.uptime_30d == null ? "기록 없음" : `${model.uptime_30d}%`],
          ["응답", formatLatency(model.avg_latency_ms)],
          ["최근 응답", model.latest_status],
        ]}
      />
    </div>
  );
}

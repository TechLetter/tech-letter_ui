import { useEffect, useMemo, useState } from "react";
import { RiArrowDownSLine, RiRefreshLine } from "react-icons/ri";
import llmModelsApi from "../../api/llmModelsApi";
import timeutils from "../../utils/timeutils";
import ModelRow from "./components/ModelRow";
import { lastDays } from "./modelFormat";

const DAYS = 30;
const STATE_ORDER = { healthy: 0, degraded: 1, down: 2 };

function byUsefulness(a, b) {
  return (
    (STATE_ORDER[a.state] ?? 3) - (STATE_ORDER[b.state] ?? 3) ||
    (b.uptime_30d ?? -1) - (a.uptime_30d ?? -1) ||
    a.model_id.localeCompare(b.model_id)
  );
}

function Section({ title, count, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title} <span className="text-slate-400">{count}</span>
        </span>
        <span>{DAYS}일 가용률</span>
      </div>
      {children}
    </section>
  );
}

export default function ModelStatus() {
  const [summary, setSummary] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, modelsRes] = await Promise.all([
          llmModelsApi.getSummary(),
          llmModelsApi.getModels(),
        ]);
        if (ignore) return;
        setSummary(summaryRes?.data || null);
        setModels(modelsRes?.data?.items || []);
      } catch (err) {
        console.log("Failed to fetch model status:", err);
        if (!ignore) setError("모델 상태를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [refreshTick]);

  const days = lastDays(DAYS);
  const sorted = useMemo(() => [...models].sort(byUsefulness), [models]);
  const available = sorted.filter((m) => m.state !== "down");
  const unavailable = sorted.filter((m) => m.state === "down");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <header className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">모델 상태</h1>
          {summary && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              사용 가능 {available.length} / {summary.total_models}
              {summary.last_checked_at &&
                ` · ${timeutils.timeDifferenceFromNow(summary.last_checked_at)} 확인`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setRefreshTick((tick) => tick + 1)}
          disabled={loading}
          aria-label="새로고침"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <RiRefreshLine className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading && models.length === 0 && (
        <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
      )}

      {available.length > 0 && (
        <Section title="사용 가능" count={available.length}>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {available.map((model) => (
              <ModelRow key={model.model_id} model={model} days={days} />
            ))}
          </ul>
        </Section>
      )}

      {unavailable.length > 0 && (
        <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>
              잠시 사용 불가 <span className="text-slate-400">{unavailable.length}</span>
            </span>
            <RiArrowDownSLine className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {unavailable.map((model) => (
              <ModelRow key={model.model_id} model={model} days={days} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

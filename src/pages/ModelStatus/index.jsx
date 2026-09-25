import { useEffect, useMemo, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
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

export default function ModelStatus() {
  const [summary, setSummary] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">모델 상태</h1>
          {summary && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              정상 {summary.healthy_count} · 불안정 {summary.degraded_count} · 사용 불가{" "}
              {summary.down_count}
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

      {sorted.length > 0 && (
        <section>
          <div className="mb-2 flex justify-end px-1 text-xs text-slate-400 dark:text-slate-500">
            {DAYS}일 가용률
          </div>
          {/* 정렬 순서가 왼쪽→오른쪽, 위→아래로 읽히게 행 우선으로 채운다.
              펼친 카드는 한 줄을 다 쓰므로 dense로 빈칸을 메운다. */}
          <ul className="grid gap-3 lg:grid-flow-dense lg:grid-cols-2">
            {sorted.map((model) => (
              <ModelRow
                key={model.model_id}
                model={model}
                days={days}
                expanded={expandedId === model.model_id}
                onToggle={() =>
                  setExpandedId((id) => (id === model.model_id ? null : model.model_id))
                }
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

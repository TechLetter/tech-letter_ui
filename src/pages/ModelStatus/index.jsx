import { useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import llmModelsApi from "../../api/llmModelsApi";
import { useUrlState } from "../../hooks/useUrlState";
import EventFeed from "./components/EventFeed";
import ModelHistoryChart from "./components/ModelHistoryChart";
import ModelTable from "./components/ModelTable";
import SummaryCards from "./components/SummaryCards";

const DEFAULT_PERIOD = "1m";
const ALLOWED_PERIODS = new Set(["1d", "1w", "1m", "1y"]);

export default function ModelStatus() {
  const [selectedModelId, setSelectedModelId] = useUrlState("model", null, {
    parse: (value) => value || null,
    serialize: (value) => value || "",
  });
  const [period, setPeriod] = useUrlState("period", DEFAULT_PERIOD, {
    parse: (value) => (ALLOWED_PERIODS.has(value) ? value : DEFAULT_PERIOD),
    serialize: (value) => (ALLOWED_PERIODS.has(value) ? value : DEFAULT_PERIOD),
  });

  const [summary, setSummary] = useState(null);
  const [models, setModels] = useState([]);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setLoadingOverview(true);
      setError("");
      try {
        const [summaryRes, modelsRes, eventsRes] = await Promise.all([
          llmModelsApi.getSummary(),
          llmModelsApi.getModels(),
          llmModelsApi.getEvents({}),
        ]);
        if (ignore) return;
        setSummary(summaryRes?.data || null);
        setModels(modelsRes?.data?.items || []);
        setEvents(eventsRes?.data?.items || []);
      } catch (err) {
        console.log("Failed to fetch model status:", err);
        if (!ignore) {
          setError("모델 상태를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setLoadingOverview(false);
      }
    }

    loadOverview();
    return () => {
      ignore = true;
    };
  }, [refreshTick]);

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      if (!selectedModelId) {
        setHistory([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const response = await llmModelsApi.getHistory(selectedModelId, { period });
        if (ignore) return;
        setHistory(response?.data?.items || []);
      } catch (err) {
        console.log("Failed to fetch model history:", err);
        if (!ignore) setHistory([]);
      } finally {
        if (!ignore) setLoadingHistory(false);
      }
    }

    loadHistory();
    return () => {
      ignore = true;
    };
  }, [selectedModelId, period]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            AI 모델 현황
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            테크레터가 요약·챗봇에 실제로 후보로 쓰는 OpenRouter 무료 모델들의 헬스체크 기록입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshTick((tick) => tick + 1)}
          disabled={loadingOverview}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RiRefreshLine className={loadingOverview ? "animate-spin" : ""} />
          새로고침
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      <SummaryCards summary={summary} loading={loadingOverview} />

      {selectedModelId && (
        <ModelHistoryChart
          modelId={selectedModelId}
          points={history}
          period={period}
          loading={loadingHistory}
          onChangePeriod={setPeriod}
          onClose={() => setSelectedModelId(null)}
        />
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <ModelTable
            models={models}
            loading={loadingOverview}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
          />
        </div>
        <EventFeed events={events} loading={loadingOverview} />
      </div>
    </div>
  );
}

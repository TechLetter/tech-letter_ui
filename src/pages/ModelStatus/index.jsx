import { Fragment, useEffect, useMemo, useState } from "react";
import llmModelsApi from "../../api/llmModelsApi";
import { useUrlParams, useUrlState } from "../../hooks/useUrlState";
import timeutils from "../../utils/timeutils";
import ModelDetail from "./components/ModelDetail";
import ModelRow from "./components/ModelRow";
import ModelToolbar from "./components/ModelToolbar";
import { lastDays } from "./modelFormat";
import { countByState, matchesQuery, sortModels } from "./modelList";

const DAYS = 30;
const DETAIL_BOX =
  "min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900";

export default function ModelStatus() {
  const [summary, setSummary] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  // 새로고침해도 남고, 챗봇 등에서 `/models?state=healthy`로 걸 수 있게 URL에 둔다.
  const [query, setQuery] = useUrlState("q", "");
  const [state, setState] = useUrlState("state", "all");
  const [sort, setSort] = useUrlState("sort", "uptime");
  const { resetParams } = useUrlParams();

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
  // 탭 개수는 검색 결과 안에서 센다 — 검색하면 탭 숫자도 같이 줄어든다.
  const searched = useMemo(() => models.filter((m) => matchesQuery(m, query)), [models, query]);
  const counts = countByState(searched);
  const shown = useMemo(
    () => sortModels(state === "all" ? searched : searched.filter((m) => m.state === state), sort),
    [searched, state, sort]
  );
  const selected = shown.findIndex((m) => m.model_id === expandedId);
  const rowEndOf = (i) => Math.min(i | 1, shown.length - 1); // 두 칸 그리드에서 i가 있는 줄의 끝
  const checkedLabel = summary?.last_checked_at
    ? timeutils.timeDifferenceFromNow(summary.last_checked_at)
    : "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <ModelToolbar
        counts={counts}
        state={state}
        onState={setState}
        query={query}
        onQuery={setQuery}
        sort={sort}
        onSort={setSort}
        checkedLabel={checkedLabel}
        loading={loading}
        onRefresh={() => setRefreshTick((tick) => tick + 1)}
      />

      {error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading && models.length === 0 && (
        <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
      )}

      {models.length > 0 && shown.length === 0 && (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {query.trim() ? `‘${query.trim()}’ 검색 결과 없음` : "해당 모델 없음"}
          </p>
          <button
            type="button"
            onClick={() => resetParams(["q", "state"])}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {query.trim() ? "검색 초기화" : "전체 보기"}
          </button>
        </div>
      )}

      {shown.length > 0 && (
        // 상세는 카드를 늘리지 않고 따로 끼운다 — 카드가 한 줄을 다 쓰면 다음 카드가
        // 빈칸으로 올라와 순서가 바뀐다. 한 칸일 땐 카드 바로 밑, 두 칸일 땐 그 줄 밑.
        <ul className="grid gap-3 lg:grid-cols-2">
          {shown.map((model, index) => {
            const expanded = expandedId === model.model_id;
            return (
              <Fragment key={model.model_id}>
                <ModelRow
                  model={model}
                  days={days}
                  expanded={expanded}
                  onToggle={() =>
                    setExpandedId((id) => (id === model.model_id ? null : model.model_id))
                  }
                />
                {expanded && (
                  <li className={`${DETAIL_BOX} lg:hidden`}>
                    <ModelDetail model={model} />
                  </li>
                )}
                {selected >= 0 && index === rowEndOf(selected) && (
                  <li className={`${DETAIL_BOX} hidden lg:block`}>
                    <ModelDetail model={shown[selected]} />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}

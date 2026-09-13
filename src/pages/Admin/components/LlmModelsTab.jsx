import { useCallback, useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import Badge from "../../../components/common/Badge";
import Table from "../../../components/common/Table";
import { showToast } from "../../../provider/toastModalBridge";
import { getLlmModels, handleAdminError } from "../../../api/adminApi";
import { formatKSTDateTime } from "../../../utils/timeutils";
import ModelPreferencesPanel from "./ModelPreferencesPanel";

/**
 * 모델 탭.
 *
 * 어떤 무료 모델이 실제로 쓸 만한지 성공률·헬스로 보여준다.
 */

const PURPOSES = [
  { value: "", label: "전체" },
  { value: "summary", label: "요약" },
  { value: "chat", label: "채팅" },
  { value: "planner", label: "계획" },
];

const rateVariant = (rate, attempts) => {
  if (!attempts) return "neutral";
  if (rate >= 0.9) return "success";
  if (rate >= 0.6) return "warning";
  return "error";
};

export default function LlmModelsTab() {
  const [models, setModels] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { items = [] } = await getLlmModels({ purpose: purpose || undefined });
      setModels(items);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [purpose]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const columns = [
    {
      key: "model_id",
      label: "모델",
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{value}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{row.purpose}</div>
        </div>
      ),
    },
    {
      key: "success_rate",
      label: "성공률",
      width: "140px",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={rateVariant(value, row.attempts)}>
            {(value * 100).toFixed(0)}%
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.successes}/{row.attempts}회
          </span>
        </div>
      ),
    },
    {
      key: "json_failures",
      label: "JSON 실패",
      width: "100px",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "rate_limited",
      label: "429",
      width: "80px",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "avg_latency_ms",
      label: "평균 지연",
      width: "110px",
      render: (value) => (
        <span className="text-sm">{value ? `${(value / 1000).toFixed(1)}s` : "-"}</span>
      ),
    },
    {
      key: "healthy",
      label: "scouter",
      width: "130px",
      render: (value, row) => {
        // scouter 가 죽으면 헬스가 없다. 그래도 통계는 보여 준다.
        if (value === null || value === undefined) {
          return <span className="text-xs text-slate-400">알 수 없음</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={value ? "success" : "error"}>{value ? "정상" : "비정상"}</Badge>
            {row.uptime_24h !== null && row.uptime_24h !== undefined && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                24h {row.uptime_24h.toFixed(0)}%
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "last_used_at",
      label: "마지막 사용",
      width: "160px",
      render: (value, row) => (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div>{value ? formatKSTDateTime(value) : "-"}</div>
          {row.last_error && <div className="line-clamp-1 text-red-500">{row.last_error}</div>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {PURPOSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"
        >
          <RiRefreshLine /> 새로고침
        </button>
      </div>

      <ModelPreferencesPanel observedModels={models} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Table
          columns={columns}
          data={models}
          loading={loading}
          emptyMessage="아직 기록된 모델 호출이 없습니다."
        />
      </div>
    </div>
  );
}

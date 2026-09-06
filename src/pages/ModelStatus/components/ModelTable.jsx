import Badge from "../../../components/common/Badge";
import Table from "../../../components/common/Table";

function statusVariant(status) {
  if (status === "OK") return "success";
  if (status === "429") return "warning";
  if (!status) return "neutral";
  return "error";
}

export default function ModelTable({ models, loading, selectedModelId, onSelectModel }) {
  // "최신 상태"를 모델명 바로 다음에 둔다 — 좁은 화면에서 스크롤 없이 보여야
  //할 가장 중요한 값이라서다. 대신 sticky는 안 쓴다: sticky 오른쪽 컬럼이
  // 우측 정렬 숫자 컬럼과 겹치면 그 값이 sticky 배경 밑에 그대로 가려진다.
  const columns = [
    {
      key: "model_id",
      label: "모델",
      render: (modelId) => (
        <code className="text-xs text-slate-700 dark:text-slate-300">{modelId}</code>
      ),
    },
    {
      key: "latest_status",
      label: "최신 상태",
      width: "110px",
      render: (value) => <Badge variant={statusVariant(value)}>{value || "알 수 없음"}</Badge>,
    },
    {
      key: "uptime_24h",
      label: "Uptime(24h)",
      width: "110px",
      align: "right",
      render: (value) => <span className="text-sm">{value.toFixed(1)}%</span>,
    },
    {
      key: "avg_latency_ms",
      label: "평균 지연",
      width: "100px",
      align: "right",
      render: (value) => (
        <span className="text-sm">{value ? `${(value / 1000).toFixed(1)}s` : "-"}</span>
      ),
    },
    {
      key: "consecutive_failures",
      label: "연속 실패",
      width: "90px",
      align: "right",
      render: (value) => <span className="text-sm">{value}</span>,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <Table
        columns={columns}
        data={models}
        loading={loading}
        emptyMessage="아직 기록된 모델 헬스체크가 없습니다."
        onRowClick={(row) => onSelectModel(row.model_id === selectedModelId ? null : row.model_id)}
      />
    </div>
  );
}

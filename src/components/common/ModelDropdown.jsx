import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { RiCheckLine } from "react-icons/ri";
import ModelStatusDot from "./ModelStatusDot";
import { classifyModelHealth, formatModelMeta, sortModelsByHealth } from "../../utils/modelHealth";

/**
 * 모델을 고르는 커스텀 드롭다운. 브라우저 기본 `<select>` 대신 써서 우리
 * 라이트/다크 테마를 그대로 따르고, 각 모델 옆에 상태 LED·uptime·지연을
 * 보여준다. 목록은 정상 → 불안정 → 장애 → 정보없음 순, 같은 상태 안에서는
 * uptime 높은 순 → 지연 낮은 순으로 정렬한다.
 *
 * 트리거 버튼의 생김새는 페이지마다 다를 수 있어 render prop으로 받는다.
 */
export default function ModelDropdown({
  options,
  onSelect,
  selectedId = "",
  loading = false,
  disabled = false,
  emptyMessage = "선택할 수 있는 모델이 없습니다.",
  leadingOption = null,
  placement = "bottom",
  align = "left",
  panelClassName = "",
  trigger,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handlePick = (modelId) => {
    onSelect(modelId);
    setOpen(false);
  };

  const sorted = sortModelsByHealth(options);
  const panelPositionClass = [
    placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
    align === "right" ? "right-0" : "left-0",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger({ open, toggle })}

      {open && (
        <div
          role="listbox"
          className={`absolute z-30 max-h-72 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 ${panelPositionClass} ${panelClassName}`}
        >
          {leadingOption && (
            <>
              <DropdownRow
                label={leadingOption.label}
                selected={selectedId === leadingOption.id}
                onClick={() => handlePick(leadingOption.id)}
              />
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
            </>
          )}

          {loading ? (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              모델 목록을 불러오는 중입니다.
            </p>
          ) : sorted.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          ) : (
            sorted.map((health) => (
              <DropdownRow
                key={health.model_id}
                label={health.model_id}
                meta={formatModelMeta(health)}
                level={classifyModelHealth(health)}
                selected={selectedId === health.model_id}
                onClick={() => handlePick(health.model_id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DropdownRow({ label, meta, level, selected, onClick }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
        selected ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
      }`}
    >
      {level && <ModelStatusDot level={level} />}
      <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{label}</span>
      {meta && <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{meta}</span>}
      {selected && <RiCheckLine className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
    </button>
  );
}

DropdownRow.propTypes = {
  label: PropTypes.string.isRequired,
  meta: PropTypes.string,
  level: PropTypes.oneOf(["healthy", "degraded", "down", "unknown"]),
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

ModelDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      model_id: PropTypes.string.isRequired,
      latest_status: PropTypes.string,
      consecutive_failures: PropTypes.number,
      uptime_24h: PropTypes.number,
      avg_latency_ms: PropTypes.number,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  emptyMessage: PropTypes.string,
  leadingOption: PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
  placement: PropTypes.oneOf(["top", "bottom"]),
  align: PropTypes.oneOf(["left", "right"]),
  panelClassName: PropTypes.string,
  trigger: PropTypes.func.isRequired,
};

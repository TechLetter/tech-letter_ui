import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { RiCheckLine } from "react-icons/ri";
import ModelStatusDot from "./ModelStatusDot";
import { classifyModelHealth, isSelectableModel, sortModelsByHealth } from "../../utils/modelHealth";

/**
 * 모델을 고르는 커스텀 드롭다운. 브라우저 기본 `<select>` 대신 써서 우리
 * 라이트/다크 테마를 그대로 따르고, 각 모델 옆에 상태 LED를 보여준다. 목록은
 * 정상 → 불안정 → 장애 → 정보없음 순, 같은 상태 안에서는 uptime 높은 순 →
 * 지연 낮은 순으로 정렬한다 — 수치 자체는 숨기고 순서로만 드러낸다.
 * 이름이 길면 잘리므로 hover 시 전체 이름이 `title`로 뜬다.
 *
 * 트리거 버튼의 생김새는 페이지마다 다를 수 있어 render prop으로 받는다.
 */
export default function ModelDropdown({
  options,
  onSelect,
  selectedId = "",
  loading = false,
  disabled = false,
  selectableOnly = false,
  emptyMessage = "선택할 수 있는 모델이 없습니다.",
  placement = "bottom",
  align = "left",
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
  const desktopPositionClass = [
    placement === "top" ? "sm:bottom-full sm:mb-2" : "sm:top-full sm:mt-2",
    align === "right" ? "sm:right-0" : "sm:left-0",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger({ open, toggle })}

      {open && (
        <>
          {/* 좁은 화면에서 작은 트리거 옆에 앵커하면 목록이 잘리거나 화면 밖으로
              넘친다. 모바일에서는 대신 화면 아래에서 올라오는 시트로 보여준다 —
              데스크톱(sm+)에서만 트리거 옆에 붙는 원래 드롭다운으로 돌아간다. */}
          <div
            className="fixed inset-0 z-20 bg-black/30 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className={`fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white py-2 shadow-lg sm:absolute sm:inset-x-auto sm:inset-y-auto sm:bottom-auto sm:max-h-72 sm:w-72 sm:rounded-xl sm:border sm:py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 ${desktopPositionClass}`}
          >
            {loading ? (
              <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                모델 목록을 불러오는 중입니다.
              </p>
            ) : sorted.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </p>
            ) : (
              sorted.map((health) => (
                <DropdownRow
                  key={health.model_id}
                  label={health.model_id}
                  level={classifyModelHealth(health)}
                  selected={selectedId === health.model_id}
                  unavailable={selectableOnly && !isSelectableModel(health)}
                  onClick={() => handlePick(health.model_id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownRow({ label, level, selected, unavailable = false, onClick }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={unavailable}
      disabled={unavailable}
      onClick={onClick}
      title={unavailable ? `${label} — 지금 사용할 수 없습니다` : label}
      className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
        unavailable ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-700"
      } ${selected ? "bg-indigo-50 dark:bg-indigo-950/40" : ""}`}
    >
      {level && <ModelStatusDot level={level} />}
      <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{label}</span>
      {selected && <RiCheckLine className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
    </button>
  );
}

DropdownRow.propTypes = {
  label: PropTypes.string.isRequired,
  level: PropTypes.oneOf(["healthy", "degraded", "down", "unknown"]),
  selected: PropTypes.bool.isRequired,
  unavailable: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ModelDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      model_id: PropTypes.string.isRequired,
      state: PropTypes.oneOf(["healthy", "degraded", "down"]),
      latest_status: PropTypes.string,
      uptime_24h: PropTypes.number,
      avg_latency_ms: PropTypes.number,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  selectableOnly: PropTypes.bool,
  emptyMessage: PropTypes.string,
  placement: PropTypes.oneOf(["top", "bottom"]),
  align: PropTypes.oneOf(["left", "right"]),
  trigger: PropTypes.func.isRequired,
};

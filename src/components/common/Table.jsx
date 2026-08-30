import PropTypes from "prop-types";

/**
 * 재사용 가능한 테이블 컴포넌트
 * HTML table 대신 div 기반으로 구현
 *
 * @param {Array} columns - 컬럼 정의 배열 [{ key, label, render?, width?, align?, sticky? }]
 *   sticky: "right" 를 주면 가로 스크롤 중에도 그 컬럼을 오른쪽에 고정한다(작업 버튼용).
 * @param {Array} data - 데이터 배열
 * @param {boolean} loading - 로딩 상태
 * @param {string} emptyMessage - 데이터 없을 때 메시지
 * @param {function} onRowClick - 행 클릭 핸들러 (optional)
 */
// 가로 스크롤 중에도 오른쪽에 고정해 둘 컬럼(보통 "작업" 버튼)의 배경·경계선·그림자.
// sticky 엘리먼트는 스크롤되는 형제 위에 겹쳐 그려지므로 배경이 없으면 뒤 컬럼이 비친다.
// 그림자는 늘 떠 있다 — "이 아래로 스크롤할 내용이 더 있다"는 신호라, 스크롤을
// 끝까지 안 해 본 좁은 화면에서 컬럼이 그냥 잘려 보이는 걸 막아 준다.
const stickyRightClass = (col, bgClass) =>
  col.sticky === "right"
    ? `sticky right-0 z-10 ${bgClass} border-l border-slate-200 dark:border-slate-700 shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.15)] dark:shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.5)]`
    : "";

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
}) {
  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-fit dark:border-slate-700 dark:bg-slate-800">
          {columns.map((col) => (
            <div
              key={col.key}
              className={`h-4 bg-slate-200 rounded animate-pulse dark:bg-slate-700 min-w-0 ${
                col.className || ""
              }`}
              style={{
                width: col.width || "auto",
                flex: col.width ? "none" : 1,
              }}
            />
          ))}
        </div>
        {/* 바디 스켈레톤 */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-slate-100 min-w-fit dark:border-slate-800"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={`h-4 bg-slate-100 rounded animate-pulse dark:bg-slate-800 min-w-0 ${
                  col.className || ""
                }`}
                style={{
                  width: col.width || "auto",
                  flex: col.width ? "none" : 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (!data || data.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-500 dark:text-slate-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-fit dark:border-slate-700 dark:bg-slate-800">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`min-w-0 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${
              col.align === "center"
                ? "text-center"
                : col.align === "right"
                ? "text-right"
                : "text-left"
            } ${stickyRightClass(col, "bg-slate-50 dark:bg-slate-800")} ${col.className || ""}`}
            style={{ width: col.width || "auto", flex: col.width ? "none" : 1 }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* 바디 */}
      {data.map((row, rowIndex) => (
        <div
          key={row.id || rowIndex}
          onClick={() => onRowClick?.(row)}
          className={`flex items-center gap-4 px-4 py-3 border-b border-slate-100 min-w-fit dark:border-slate-700/50 ${
            onRowClick
              ? "cursor-pointer hover:bg-slate-50 transition-colors dark:hover:bg-slate-800"
              : ""
          }`}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={`min-w-0 text-sm text-slate-700 dark:text-slate-300 ${
                col.align === "center"
                  ? "text-center"
                  : col.align === "right"
                  ? "text-right"
                  : "text-left"
              } ${stickyRightClass(col, "bg-white dark:bg-slate-800")} ${col.className || ""}`}
              style={{
                width: col.width || "auto",
                flex: col.width ? "none" : 1,
              }}
            >
              {col.render ? col.render(row[col.key], row) : row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      width: PropTypes.string,
      align: PropTypes.oneOf(["left", "center", "right"]),
      className: PropTypes.string,
      sticky: PropTypes.oneOf(["right"]),
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
};

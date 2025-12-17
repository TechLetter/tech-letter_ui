import PropTypes from "prop-types";

/**
 * 재사용 가능한 테이블 컴포넌트
 * HTML table 대신 div 기반으로 구현
 *
 * @param {Array} columns - 컬럼 정의 배열 [{ key, label, render?, width?, align? }]
 * @param {Array} data - 데이터 배열
 * @param {boolean} loading - 로딩 상태
 * @param {string} emptyMessage - 데이터 없을 때 메시지
 * @param {function} onRowClick - 행 클릭 핸들러 (optional)
 */
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
      <div className="w-full">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          {columns.map((col) => (
            <div
              key={col.key}
              className="h-4 bg-slate-200 rounded animate-pulse dark:bg-slate-700"
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
            className="flex items-center gap-4 px-4 py-4 border-b border-slate-100 dark:border-slate-800"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="h-4 bg-slate-100 rounded animate-pulse dark:bg-slate-800"
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
            className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${
              col.align === "center"
                ? "text-center"
                : col.align === "right"
                ? "text-right"
                : "text-left"
            }`}
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
              className={`text-sm text-slate-700 dark:text-slate-300 ${
                col.align === "center"
                  ? "text-center"
                  : col.align === "right"
                  ? "text-right"
                  : "text-left"
              }`}
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
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
};

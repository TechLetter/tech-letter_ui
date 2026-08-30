import { useEffect, useRef, useState } from "react";
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
// 가로 스크롤 중에도 오른쪽에 고정해 둘 컬럼(보통 "작업" 버튼)의 배경·경계선.
// sticky 엘리먼트는 스크롤되는 형제 위에 겹쳐 그려지므로 배경이 없으면 뒤 컬럼이 비친다.
// 경계선은 실제로 가로 스크롤이 있을 때만 붙인다(hasOverflow) — 안 그러면 스크롤할
// 게 없는 넓은 화면에서도 마지막 컬럼 옆에 정체 모를 선이 늘 떠 있게 된다.
// (box-shadow로 시도했다가 뺐다 — blur가 위아래로도 번져서 액션 칸이 둥근 칩처럼 떠 보였다.)
// pr-4는 스크롤이 있을 때만 준다 — sticky는 행의 padding(px-4)이 아니라 스크롤
// 컨테이너 가장자리에 딱 붙으므로, 그 여백을 셀 자체에 다시 넣어 주지 않으면
// 오른쪽 끝에 붙어 잘린 것처럼 보인다.
const stickyRightClass = (col, bgClass, hasOverflow) => {
  if (col.sticky !== "right") return "";
  if (!hasOverflow) return `sticky right-0 z-10 ${bgClass}`;
  return `sticky right-0 z-10 pr-4 ${bgClass} border-l border-slate-200 dark:border-slate-700`;
};

// 다른 컬럼들은 행의 `items-center`(교차축 center)를 그대로 받아 자기 내용
// 높이만큼만 차지한다 — 옆 컬럼이 그보다 키가 크면 위아래에 빈틈이 생긴다.
// sticky 컬럼은 그 빈틈으로 스크롤되는 다른 컬럼의 내용(예: 상태 뱃지)이
// 비쳐 보이므로, `self-stretch`로 행 높이 전체를 차지하게 하고 내용은
// flex+justify로 다시 정렬한다.
const alignClass = (col) => {
  const justify =
    col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start";
  if (col.sticky === "right") return `flex items-center self-stretch ${justify}`;
  return col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
};

// `width` 없는 컬럼은 flex:1로 남는 공간을 채우는 용도다. 그런데 `min-w-0`가
// 붙어 있으면(다른 고정폭 컬럼이 flex:none으로 자기 폭을 지키게 하려고 붙인 것)
// 브라우저가 이 컬럼의 최소 너비를 0으로 보고, 좁은 화면에서 고정폭 컬럼 합이
// 뷰포트에 가까워지면 스크롤 대신 이 컬럼만 글자 단위로 줄바꿈될 때까지 짜부라뜨린다.
// 최소 너비를 줘서 그 대신 행 전체가 가로 스크롤되게 한다.
const FLEXIBLE_COLUMN_MIN_WIDTH = "160px";
const cellStyle = (col) => ({
  width: col.width || "auto",
  flex: col.width ? "none" : 1,
  minWidth: col.width ? undefined : FLEXIBLE_COLUMN_MIN_WIDTH,
});

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
}) {
  const scrollRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const checkOverflow = () => setHasOverflow(el.scrollWidth > el.clientWidth + 1);
    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [columns, data, loading]);

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
              style={cellStyle(col)}
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
                style={cellStyle(col)}
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
    <div ref={scrollRef} className="w-full overflow-x-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-fit dark:border-slate-700 dark:bg-slate-800">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`min-w-0 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${alignClass(
              col
            )} ${stickyRightClass(col, "bg-slate-50 dark:bg-slate-800", hasOverflow)} ${
              col.className || ""
            }`}
            style={cellStyle(col)}
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
              className={`min-w-0 text-sm text-slate-700 dark:text-slate-300 ${alignClass(
                col
              )} ${stickyRightClass(col, "bg-white dark:bg-slate-800", hasOverflow)} ${
                col.className || ""
              }`}
              style={cellStyle(col)}
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

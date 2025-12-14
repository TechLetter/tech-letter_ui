import PropTypes from "prop-types";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
} from "react-icons/ri";

/**
 * 페이지네이션 컴포넌트
 * @param {number} currentPage - 현재 페이지 (1-indexed)
 * @param {number} totalPages - 전체 페이지 수
 * @param {function} onPageChange - 페이지 변경 핸들러
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const canGoFirst = currentPage > 1;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const canGoLast = currentPage < totalPages;

  // 표시할 페이지 번호 계산 (최대 5개)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // 시작/끝 조정하여 항상 5개 표시 (가능한 경우)
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(totalPages, start + 4);
      } else if (end === totalPages) {
        start = Math.max(1, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1">
      {/* 맨 처음 버튼 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={!canGoFirst}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="첫 페이지"
      >
        <RiArrowLeftDoubleLine className="text-xl" />
      </button>

      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <RiArrowLeftSLine className="text-xl" />
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="다음 페이지"
      >
        <RiArrowRightSLine className="text-xl" />
      </button>

      {/* 맨 끝 버튼 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={!canGoLast}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="마지막 페이지"
      >
        <RiArrowRightDoubleLine className="text-xl" />
      </button>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

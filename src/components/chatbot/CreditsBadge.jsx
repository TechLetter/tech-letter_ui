import { RiCoinLine } from "react-icons/ri";

/**
 * CreditsBadge - 크레딧 잔액 표시 배지
 * @param {Object} props
 * @param {number} props.credits - 현재 크레딧 잔액
 * @param {string} [props.className] - 추가 클래스명
 */
export default function CreditsBadge({ credits, className = "" }) {
  const isLow = credits <= 2;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium
        ${
          isLow
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }
        ${className}
      `}
    >
      <RiCoinLine className={isLow ? "text-amber-500" : "text-slate-400"} />
      <span>{credits ?? "-"}</span>
    </div>
  );
}

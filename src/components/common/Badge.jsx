import PropTypes from "prop-types";

/**
 * 상태 표시용 뱃지 컴포넌트
 * @param {string} variant - success | warning | error | info | neutral
 * @param {string} children - 뱃지 텍스트
 */
export default function Badge({ variant = "neutral", children }) {
  const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

  const variantClasses = {
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf(["success", "warning", "error", "info", "neutral"]),
  children: PropTypes.node.isRequired,
};

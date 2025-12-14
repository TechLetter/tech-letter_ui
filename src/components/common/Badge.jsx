import PropTypes from "prop-types";

/**
 * 상태 표시용 뱃지 컴포넌트
 * @param {string} variant - success | warning | error | info | neutral
 * @param {string} children - 뱃지 텍스트
 * @param {string} size - sm | md
 */
export default function Badge({ variant = "neutral", size = "sm", children }) {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  const variantClasses = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf(["success", "warning", "error", "info", "neutral"]),
  size: PropTypes.oneOf(["sm", "md"]),
  children: PropTypes.node.isRequired,
};

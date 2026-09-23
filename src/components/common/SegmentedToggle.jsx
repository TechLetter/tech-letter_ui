import PropTypes from "prop-types";

const SELECTED = "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300";
const UNSELECTED =
  "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100";
const PILL = "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors";

/** 세그먼트 토글의 버튼들. 감싸는 컨테이너는 호출부가 화면에 맞게 정한다. */
export default function SegmentedToggle({ options, value, onChange, buttonClassName = PILL }) {
  return options.map((option) => (
    <button
      type="button"
      key={option.value}
      onClick={() => onChange(option.value)}
      className={`${buttonClassName} ${value === option.value ? SELECTED : UNSELECTED}`}
    >
      {option.label}
    </button>
  ));
}

SegmentedToggle.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.node.isRequired })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  buttonClassName: PropTypes.string,
};

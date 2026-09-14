import PropTypes from "prop-types";
import { HEALTH_DOT_CLASS, HEALTH_LABEL } from "../../utils/modelHealth";

/** 모델 상태를 나타내는 작은 LED 점. 초록=정상, 주황=불안정, 빨강=장애, 회색=정보 없음. */
export default function ModelStatusDot({ level, className = "" }) {
  return (
    <span
      role="img"
      aria-label={HEALTH_LABEL[level]}
      title={HEALTH_LABEL[level]}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT_CLASS[level]} ${className}`}
    />
  );
}

ModelStatusDot.propTypes = {
  level: PropTypes.oneOf(["healthy", "degraded", "down", "unknown"]).isRequired,
  className: PropTypes.string,
};

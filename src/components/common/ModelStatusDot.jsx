import PropTypes from "prop-types";
import { HEALTH_DOT_CLASS, HEALTH_LABEL } from "../../utils/modelHealth";

/** 모델 상태를 나타내는 작은 LED 점. 초록=정상, 주황=불안정, 빨강=장애, 회색=정보 없음. */
export default function ModelStatusDot({ level, detail = "" }) {
  const label = detail ? `${HEALTH_LABEL[level]} · ${detail}` : HEALTH_LABEL[level];
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT_CLASS[level]}`}
    />
  );
}

ModelStatusDot.propTypes = {
  level: PropTypes.oneOf(["healthy", "degraded", "down", "unknown"]).isRequired,
  detail: PropTypes.string,
};

import { formatKSTDateTime, timeDifferenceFromNow } from "../../utils/timeutils";

/** 어드민 시각 표시. 화면에는 상대 시간, 정확한 시각은 툴팁(`title`)으로. */
export function relativeTime(iso) {
  return iso ? timeDifferenceFromNow(iso) : "-";
}

export function exactTime(iso) {
  return iso ? formatKSTDateTime(iso) : "";
}

/** 예약된 시각. "오늘 16:00" / "내일 16:00" / "9월 28일 16:00". */
export function scheduleLabel(iso, now = new Date()) {
  const at = new Date(iso);
  const hm = at.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const days = Math.round(
    (new Date(at.getFullYear(), at.getMonth(), at.getDate()) -
      new Date(now.getFullYear(), now.getMonth(), now.getDate())) /
      86_400_000
  );
  if (days === 0) return `오늘 ${hm}`;
  if (days === 1) return `내일 ${hm}`;
  return `${at.getMonth() + 1}월 ${at.getDate()}일 ${hm}`;
}

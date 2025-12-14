// ISO 시간 문자열을 클라이언트 시간대로 변환
function toLocalDate(isoString) {
  return new Date(isoString);
}

// 클라이언트 시간대 기준 YYYY.MM.DD 문자열 반환
function formatLocalDate(isoString) {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

// 클라이언트 시간대 기준 YYYY. MM. DD. HH:MM 문자열 반환
export function formatKSTDateTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 클라이언트 시간 기준으로 N시간 전/후인지 계산
export function timeDifferenceFromNow(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  let diffMs = date - now;
  const past = diffMs < 0;
  diffMs = Math.abs(diffMs);

  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  if (years > 0) return past ? `${years}년 전` : `${years}년 후`;

  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (months > 0) return past ? `${months}개월 전` : `${months}개월 후`;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 0) return past ? `${days}일 전` : `${days}일 후`;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours > 0) return past ? `${hours}시간 전` : `${hours}시간 후`;

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes > 0) return past ? `${minutes}분 전` : `${minutes}분 후`;

  return "방금";
}

const timeutils = {
  toLocalDate,
  formatLocalDate,
  formatDateTime: formatKSTDateTime,
  timeDifferenceFromNow,
};

export default timeutils;

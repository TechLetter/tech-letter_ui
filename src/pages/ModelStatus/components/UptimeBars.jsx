function barTone(uptime) {
  if (uptime == null) return "bg-slate-200 dark:bg-slate-700";
  if (uptime >= 90) return "bg-emerald-500 dark:bg-emerald-400";
  if (uptime >= 50) return "bg-amber-400 dark:bg-amber-300";
  return "bg-rose-500 dark:bg-rose-400";
}

/** 하루 한 칸. 기록이 없는 날은 회색이다. 스크린리더에는 숨긴다 — 카드 버튼의
 * 이름에 날짜 30개가 섞였다. 30일 가용률은 카드 오른쪽 숫자가 읽힌다. */
export default function UptimeBars({ days, daily }) {
  const byDate = Object.fromEntries((daily || []).map((d) => [d.date, d.uptime]));
  return (
    <div aria-hidden="true" className="flex h-6 items-stretch gap-[2px]">
      {days.map((date) => {
        const uptime = byDate[date];
        const label = `${date.slice(5).replace("-", "월 ")}일 · ${
          uptime == null ? "기록 없음" : `${uptime}%`
        }`;
        return (
          <span
            key={date}
            title={label}
            className={`flex-1 rounded-[2px] ${barTone(uptime)}`}
          />
        );
      })}
    </div>
  );
}

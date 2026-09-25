import { useEffect, useState } from "react";
import trendsApi from "../api/trendsApi";
import WeeklyTopicCard from "../components/trends/WeeklyTopicCard";
import timeutils from "../utils/timeutils";

const TOPIC_LIMIT = 8;

export default function Trends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await trendsApi.getWeekly({ limit: TOPIC_LIMIT });
        if (!ignore) setData(response?.data || null);
      } catch (err) {
        console.log("Failed to fetch weekly trends:", err);
        if (!ignore) setError("기술 흐름을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const items = data?.items || [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          주간 기술 흐름
        </h2>
        {data && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {timeutils.formatLocalDate(data.period.from_at)} ~{" "}
            {timeutils.formatLocalDate(data.period.to)} · {data.blog_count}개 회사의{" "}
            {data.post_count}개 글
          </p>
        )}
      </header>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-4 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          최근 7일 동안 올라온 글이 없습니다.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <WeeklyTopicCard key={item.topic} rank={index + 1} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

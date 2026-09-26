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
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight text-ink lg:text-2xl">이번 주 흐름</h1>
        {data && (
          <>
            <span className="font-mono text-xs text-ink-3">
              {timeutils.formatLocalDate(data.period.from_at)} – {timeutils.formatLocalDate(data.period.to)}
            </span>
            <span className="text-xs text-ink-3">
              블로그 <span className="font-mono">({data.blog_count})</span> · 글 <span className="font-mono">({data.post_count})</span>
            </span>
          </>
        )}
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-4 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-3 py-8 text-center text-sm text-ink-3">
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

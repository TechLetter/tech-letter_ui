import { useEffect, useState } from "react";
import { getBlogs, getJobStats, getPosts, getUsers } from "../../api/adminApi";

/**
 * 사이드바에 늘 보이는 숫자. 메뉴별 개수와 파이프라인 상태 세 줄
 * (실패한 잡 · 대기 중인 잡과 재개 시각 · 마지막 RSS 수집)을 만든다.
 * `refreshKey`가 바뀌면(탭 이동) 다시 읽는다.
 */
export default function useAdminSummary(refreshKey) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      getJobStats(),
      getBlogs({ page_size: 100 }),
      getPosts({ page_size: 1 }),
      getUsers({ page_size: 1 }),
    ]).then(([stats, blogs, posts, users]) => {
      if (ignore) return;
      const value = (result) => (result.status === "fulfilled" ? result.value : null);
      setSummary(summarize(value(stats), value(blogs), value(posts), value(users)));
    });
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return summary;
}

function summarize(stats, blogs, posts, users) {
  const byStatus = stats?.by_status || {};
  const active = (blogs?.items || []).filter((blog) => blog.is_active);
  const lastFetchedAt = active
    .map((blog) => blog.last_fetched_at)
    .filter(Boolean)
    .sort()
    .at(-1);
  const nextRunAt = stats?.oldest_pending_at;
  return {
    counts: { posts: posts?.total, blogs: blogs?.total, users: users?.total },
    dead: byStatus.dead ?? 0,
    pending: byStatus.pending ?? 0,
    // 대기 잡 중 가장 이른 실행 시각이 미래면 전부 미뤄진 것이다(임베딩 할당량 대기 등).
    resumeAt: nextRunAt && new Date(nextRunAt) > new Date() ? nextRunAt : null,
    lastFetchedAt,
    failingBlogs: active.filter((blog) => blog.consecutive_failures > 0).length,
    activeBlogs: active.length,
  };
}

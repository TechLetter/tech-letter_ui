import { useCallback, useEffect, useMemo, useState } from "react";
import trendsApi from "../api/trendsApi";
import RisingTagsPanel from "../components/trends/RisingTagsPanel";
import TrendControls from "../components/trends/TrendControls";
import TrendLineChart from "../components/trends/TrendLineChart";
import TrendPostList from "../components/trends/TrendPostList";
import { useUrlState } from "../hooks/useUrlState";

const MAX_SELECTED_TAGS = 5;
const TREND_POST_PAGE_SIZE = 8;
const DEFAULT_TREND_PERIOD = "180d";
const ALLOWED_TREND_PERIODS = new Set(["30d", "180d", "365d", "3y"]);

export default function Trends() {
  const [period, setPeriod] = useUrlState("period", DEFAULT_TREND_PERIOD, {
    parse: (value) =>
      ALLOWED_TREND_PERIODS.has(value) ? value : DEFAULT_TREND_PERIOD,
    serialize: (value) =>
      ALLOWED_TREND_PERIODS.has(value) ? value : DEFAULT_TREND_PERIOD,
  });
  const [interval, setInterval] = useUrlState("interval", "week");
  const [selectedTags, setSelectedTags] = useUrlState("tags", [], {
    parse: (value) => (value ? value.split(",").filter(Boolean) : []),
    serialize: (value) =>
      Array.isArray(value) && value.length > 0 ? value.join(",") : "",
  });

  const [risingTags, setRisingTags] = useState([]);
  const [series, setSeries] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingRising, setLoadingRising] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [trendError, setTrendError] = useState("");
  const [postsError, setPostsError] = useState("");

  const isOverviewMode = selectedTags.length === 0;
  const chartTags = useMemo(() => {
    if (selectedTags.length > 0) {
      return selectedTags;
    }
    return risingTags.slice(0, MAX_SELECTED_TAGS).map((item) => item.tag);
  }, [risingTags, selectedTags]);

  const toggleTag = useCallback(
    (tagName) => {
      if (!tagName) return;
      if (selectedTags.includes(tagName)) {
        setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
        return;
      }
      if (selectedTags.length >= MAX_SELECTED_TAGS) return;
      setSelectedTags([...selectedTags, tagName]);
    },
    [selectedTags, setSelectedTags]
  );

  useEffect(() => {
    let ignore = false;

    async function loadRisingTags() {
      setLoadingRising(true);
      setTrendError("");
      try {
        const response = await trendsApi.getRisingTags({
          period,
          limit: 10,
        });
        if (ignore) return;
        setRisingTags(response?.data?.items || []);
      } catch (error) {
        console.log("Failed to fetch rising tags:", error);
        if (!ignore) {
          setRisingTags([]);
          setTrendError("트렌드 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setLoadingRising(false);
      }
    }

    loadRisingTags();
    return () => {
      ignore = true;
    };
  }, [period]);

  useEffect(() => {
    let ignore = false;

    async function loadSeries() {
      if (chartTags.length === 0) {
        setSeries([]);
        return;
      }

      setLoadingSeries(true);
      setTrendError("");
      try {
        const response = await trendsApi.getSeries({
          tags: chartTags,
          period,
          interval,
        });
        if (ignore) return;
        // 응답은 `items` 키를 쓴다.
        setSeries(response?.data?.items || []);
      } catch (error) {
        console.log("Failed to fetch trend series:", error);
        if (!ignore) {
          setSeries([]);
          setTrendError("트렌드 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setLoadingSeries(false);
      }
    }

    loadSeries();
    return () => {
      ignore = true;
    };
  }, [chartTags, interval, period]);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      if (chartTags.length === 0) {
        setPosts([]);
        return;
      }

      setLoadingPosts(true);
      setPostsError("");
      try {
        const response = await trendsApi.getPosts({
          tags: chartTags,
          period,
          page: 1,
          page_size: TREND_POST_PAGE_SIZE,
        });
        if (ignore) return;
        setPosts(response?.data?.items || []);
      } catch (error) {
        console.log("Failed to fetch trend posts:", error);
        if (!ignore) {
          setPosts([]);
          setPostsError("관련 포스트를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setLoadingPosts(false);
      }
    }

    loadPosts();
    return () => {
      ignore = true;
    };
  }, [chartTags, period]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <TrendControls
        period={period}
        interval={interval}
        isOverviewMode={isOverviewMode}
        onChangePeriod={setPeriod}
        onChangeInterval={setInterval}
      />

      {trendError && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm text-rose-600 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300">
          {trendError}
        </p>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="order-2 min-w-0 space-y-4 xl:order-1">
          <TrendLineChart series={series} loading={loadingSeries} />
          <TrendPostList
            posts={posts}
            loading={loadingPosts}
            error={postsError}
          />
        </div>

        <div className="order-1 xl:sticky xl:top-20 xl:order-2">
          <RisingTagsPanel
            items={risingTags}
            loading={loadingRising}
            selectedTags={selectedTags}
            maxSelectedTags={MAX_SELECTED_TAGS}
            onToggleTag={toggleTag}
          />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RiDeleteBinLine, RiSparklingLine, RiDatabase2Line, RiAddLine } from "react-icons/ri";
import BlogIcon from "../../../components/common/BlogIcon";
import Table from "../../../components/common/Table";
import { DEFAULT_PAGE_SIZE } from "../../../components/common/Pagination";
import {
  getPosts,
  getBlogs,
  deletePost,
  triggerSummarize,
  triggerEmbed,
  handleAdminError,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { useUrlState } from "../../../hooks/useUrlState";
import { exactTime } from "../adminFormat";
import llmModelsApi from "../../../api/llmModelsApi";
import { displayName } from "../../../utils/modelName";
import {
  CONTROL,
  Tip,
  IconAction,
  PrimaryButton,
  RefreshButton,
  RelTime,
  SearchBox,
  StateTabs,
  Toolbar,
} from "./AdminKit";
import CreatePostModal from "./CreatePostModal";

// 상태 탭 → 목록 API 조건. 요약 대기에는 영구 실패도 섞여 있다(실패 탭이 따로 있다).
const STATES = [
  { id: "all", label: "전체", params: {} },
  { id: "unsummarized", label: "요약 대기", tone: "slate", params: { summarized: false } },
  { id: "unembedded", label: "임베딩 대기", tone: "amber", params: { embedded: false } },
  { id: "failed", label: "실패", tone: "rose", params: { failed: true } },
];

/** 점 하나에 상태, 툴팁에 어떤 모델로 언제 했는지. */
function StatusDot({ tone, lines }) {
  return (
    <Tip content={lines}>
      <span aria-hidden="true" className={`m-1 inline-block h-2 w-2 rounded-full ${DOT_TONES[tone]}`} />
    </Tip>
  );
}
const DOT_TONES = { emerald: "bg-emerald-500", rose: "bg-rose-500", slate: "bg-slate-300 dark:bg-slate-600" };

function summaryDot(post, modelName) {
  if (post.status?.summarized) {
    const s = post.ai_summary || {};
    return <StatusDot tone="emerald" lines={["요약 완료", modelName(s.model_name), exactTime(s.generated_at)]} />;
  }
  if (post.status?.failed_reason) return <StatusDot tone="rose" lines={["요약 실패", post.status.failed_reason]} />;
  return <StatusDot tone="slate" lines={["요약 대기"]} />;
}

function embeddingDot(post) {
  if (post.status?.embedded) {
    const e = post.embedding || {};
    return <StatusDot tone="emerald" lines={["임베딩 완료", e.model_name, exactTime(e.embedded_at)]} />;
  }
  return <StatusDot tone="slate" lines={["임베딩 대기"]} />;
}

export default function PostsTab() {
  const [, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [models, setModels] = useState([]);

  const [page, setPage] = useUrlState("page", 1, { parse: Number });
  const [state] = useUrlState("state", "all");
  const [blogId] = useUrlState("blog", "");
  const [query] = useUrlState("q", "");

  // 필터를 바꾸면 페이지는 처음으로.
  const setFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("page");
          if (!value || value === "all") next.delete(key);
          else next.set(key, String(value));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 요약 모델 id를 공식 이름으로 보여 주려고.
  useEffect(() => {
    llmModelsApi
      .getModels()
      .then((res) => setModels(res?.data?.items || []))
      .catch(() => {});
  }, []);
  const modelName = (id) => {
    if (!id) return "";
    const found = models.find((m) => m.model_id === id);
    const { provider, name } = displayName(found || { model_id: id });
    return provider ? `${provider} · ${name}` : name;
  };

  useEffect(() => {
    getBlogs({ page: 1, page_size: 100 })
      .then((data) => setBlogs((data.items || []).sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const base = { blog_id: blogId || undefined, q: query || undefined };
    const current = STATES.find((item) => item.id === state) || STATES[0];
    try {
      // 탭 옆 개수는 같은 블로그·검색 조건으로 센다.
      const [data, ...totals] = await Promise.all([
        getPosts({ ...base, ...current.params, page, page_size: DEFAULT_PAGE_SIZE }),
        ...STATES.map((item) => getPosts({ ...base, ...item.params, page: 1, page_size: 1 })),
      ]);
      setPosts(data.items || []);
      setTotalPages(data.total_pages || 0);
      setCounts(Object.fromEntries(STATES.map((item, i) => [item.id, totals[i].total])));
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, state, blogId, query]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 액션 핸들러들
  const handleDelete = async (post) => {
    if (!confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) return;

    setActionLoading({ id: post.id, action: "delete" });
    try {
      await deletePost(post.id);
      showToast("포스트가 삭제되었습니다.", "success");
      fetchPosts();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSummarize = async (post) => {
    setActionLoading({ id: post.id, action: "summarize" });
    try {
      await triggerSummarize(post.id);
      showToast("AI 요약이 요청되었습니다.", "success");
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmbed = async (post) => {
    setActionLoading({ id: post.id, action: "embed" });
    try {
      await triggerEmbed(post.id);
      showToast("임베딩이 요청되었습니다.", "success");
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostCreated = () => {
    setCreateModalOpen(false);
    fetchPosts();
  };

  const columns = [
    {
      key: "title",
      label: "제목",
      render: (title, row) => (
        <div className="min-w-0 space-y-0.5">
          <a href={row.link} target="_blank" rel="noopener noreferrer" title={`${title}\n${row.id}`} className="block">
            <span className="line-clamp-1 font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400">
              {title}
            </span>
          </a>
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {row.blog_id && <BlogIcon blogId={row.blog_id} name={row.blog_name} size={14} />}
            <span className="truncate">{row.blog_name || "-"}</span>
          </div>
          {row.status?.failed_reason && (
            <div className="truncate text-xs text-rose-600 dark:text-rose-400" title={row.status.failed_reason}>
              {row.status.failed_reason}
            </div>
          )}
        </div>
      ),
    },
    { key: "published_at", label: "발행", width: "84px", render: (iso) => <RelTime iso={iso} /> },
    { key: "created_at", label: "수집", width: "84px", render: (iso) => <RelTime iso={iso} /> },
    { key: "summary", label: "요약", width: "48px", align: "center", render: (_, row) => summaryDot(row, modelName) },
    { key: "embedding", label: "임베딩", width: "56px", align: "center", render: (_, row) => embeddingDot(row) },
    {
      key: "actions",
      label: "",
      width: "112px",
      align: "right",
      sticky: "right",
      render: (_, row) => {
        const busy = actionLoading?.id === row.id;
        return (
          <div className="flex items-center justify-end gap-0.5">
            <IconAction onClick={() => handleSummarize(row)} disabled={busy} label="요약 다시 하기" tone="amber">
              <RiSparklingLine className="h-4 w-4" />
            </IconAction>
            <IconAction onClick={() => handleEmbed(row)} disabled={busy} label="임베딩 다시 하기" tone="blue">
              <RiDatabase2Line className="h-4 w-4" />
            </IconAction>
            <IconAction onClick={() => handleDelete(row)} disabled={busy} label="삭제" tone="rose">
              <RiDeleteBinLine className="h-4 w-4" />
            </IconAction>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Toolbar
        left={
          <StateTabs
            tabs={STATES.map((item) => ({ ...item, count: counts[item.id] }))}
            value={state}
            onChange={(id) => setFilter("state", id)}
          />
        }
        right={
          <>
            <SearchBox id="post-search" value={query} onChange={(v) => setFilter("q", v.trim())} placeholder="제목 검색" />
            <label htmlFor="post-blog" className="sr-only">
              블로그
            </label>
            <select
              id="post-blog"
              value={blogId}
              onChange={(e) => setFilter("blog", e.target.value)}
              className={`${CONTROL} w-36 px-2`}
            >
              <option value="">블로그 전체</option>
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.name}
                </option>
              ))}
            </select>
            <RefreshButton onClick={fetchPosts} loading={loading} />
            <PrimaryButton onClick={() => setCreateModalOpen(true)} icon={<RiAddLine className="h-4 w-4" />}>
              추가
            </PrimaryButton>
          </>
        }
      />

      <Table
        columns={columns}
        data={posts}
        loading={loading}
        emptyMessage="해당 포스트 없음"
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      <CreatePostModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handlePostCreated}
      />
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiRssLine } from "react-icons/ri";
import Table from "../../../components/common/Table";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  handleAdminError,
  updateBlog,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { useUrlState } from "../../../hooks/useUrlState";
import { Dot, IconAction, PrimaryButton, RefreshButton, RelTime, SearchBox, StateTabs, Toolbar } from "./AdminKit";
import BlogFormModal from "./BlogFormModal";
import DeleteBlogModal from "./DeleteBlogModal";

// 블로그는 50개 남짓이라 한 번에 받아 화면에서 거르고 정렬한다.
const STATES = [
  { id: "all", label: "전체" },
  { id: "failing", label: "실패", tone: "amber" },
  { id: "paused", label: "중지", tone: "slate" },
];

const isFailing = (blog) => blog.is_active && blog.consecutive_failures > 0;
const matchesState = (blog, state) =>
  state === "failing" ? isFailing(blog) : state === "paused" ? !blog.is_active : true;
// 손봐야 할 것부터: 실패 → 중지 → 이름순.
const rank = (blog) => (isFailing(blog) ? 0 : blog.is_active ? 2 : 1);

function host(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 짧은 오류 이름. 전체 문장은 툴팁으로. */
function shortError(error = "") {
  const status = error.match(/\b(4\d\d|5\d\d)\b/);
  if (status) return `HTTP ${status[1]}`;
  return error.split(":")[0].slice(0, 24) || "오류";
}

function statusCell(blog) {
  if (!blog.is_active) return <Dot tone="slate" label="수집 중지" />;
  if (!isFailing(blog)) return <Dot tone="emerald" label="정상" />;
  const tip = `${blog.consecutive_failures}회 연속 실패 · ${blog.last_fetch_error || ""}`;
  return (
    <span className="flex min-w-0 items-center gap-2" title={tip}>
      <Dot tone="amber" label={tip} />
      <span className="truncate text-xs tabular-nums text-amber-700 dark:text-amber-300">
        {shortError(blog.last_fetch_error)} · {blog.consecutive_failures}회
      </span>
    </span>
  );
}

export default function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    open: false,
    mode: "create",
    blog: null,
  });
  const [deleteState, setDeleteState] = useState({ open: false, blog: null });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [state, setState] = useUrlState("state", "all");
  const [query, setQuery] = useUrlState("q", "");

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogs({ page: 1, page_size: 100 });
      setBlogs(data.items || []);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((b) => !q || `${b.name} ${b.url}`.toLowerCase().includes(q));
  }, [blogs, query]);
  const shown = useMemo(
    () =>
      searched
        .filter((b) => matchesState(b, state))
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
    [searched, state]
  );
  const counts = Object.fromEntries(STATES.map((item) => [item.id, searched.filter((b) => matchesState(b, item.id)).length]));

  const openCreateModal = () => {
    setFormState({ open: true, mode: "create", blog: null });
  };

  const openEditModal = (blog) => {
    setFormState({ open: true, mode: "edit", blog });
  };

  const closeFormModal = () => {
    setFormState((prev) => ({ ...prev, open: false }));
  };

  const openDeleteModal = (blog) => {
    setDeleteState({ open: true, blog });
  };

  const closeDeleteModal = () => {
    setDeleteState({ open: false, blog: null });
  };

  const handleSubmitBlog = async (payload) => {
    setSubmitting(true);
    try {
      if (formState.mode === "edit" && formState.blog) {
        await updateBlog(formState.blog.id, payload);
        showToast("블로그가 수정되었습니다.", "success");
      } else {
        await createBlog(payload);
        showToast("블로그가 추가되었습니다.", "success");
      }
      closeFormModal();
      fetchBlogs();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async ({ delete_posts }) => {
    if (!deleteState.blog) return;

    setActionLoadingId(deleteState.blog.id);
    try {
      const result = await deleteBlog(deleteState.blog.id, { delete_posts });
      const deletedPosts = result.deleted_posts || 0;
      showToast(
        delete_posts
          ? `블로그와 포스트 ${deletedPosts}개가 삭제되었습니다.`
          : "블로그가 삭제되었습니다.",
        "success"
      );
      closeDeleteModal();
      fetchBlogs();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "블로그",
      render: (name, row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <a href={row.url} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate">
              <span className="font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400">
                {name}
              </span>
            </a>
            <a
              href={row.rss_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} RSS`}
              title={row.rss_url}
              className="shrink-0"
            >
              <RiRssLine className="h-3.5 w-3.5 text-slate-300 hover:text-orange-500 dark:text-slate-600" />
            </a>
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">{host(row.url)}</div>
        </div>
      ),
    },
    {
      key: "post_count",
      label: "포스트",
      width: "64px",
      align: "right",
      render: (count) => (
        <span className="tabular-nums text-slate-700 dark:text-slate-200">{(count || 0).toLocaleString()}</span>
      ),
    },
    { key: "status", label: "상태", width: "150px", render: (_, row) => statusCell(row) },
    { key: "last_fetched_at", label: "최근 수집", width: "84px", render: (iso) => <RelTime iso={iso} /> },
    {
      key: "actions",
      label: "",
      width: "76px",
      align: "right",
      sticky: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-0.5">
          <IconAction onClick={() => openEditModal(row)} disabled={actionLoadingId === row.id} label="수정">
            <RiEditLine className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={() => openDeleteModal(row)} disabled={actionLoadingId === row.id} label="삭제" tone="rose">
            <RiDeleteBinLine className="h-4 w-4" />
          </IconAction>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Toolbar
        left={
          <StateTabs
            tabs={STATES.map((item) => ({ ...item, count: counts[item.id] }))}
            value={state}
            onChange={(id) => setState(id === "all" ? undefined : id)}
          />
        }
        right={
          <>
            <SearchBox id="blog-search" value={query} onChange={(v) => setQuery(v.trim() || undefined)} placeholder="블로그 검색" />
            <RefreshButton onClick={fetchBlogs} loading={loading} />
            <PrimaryButton onClick={openCreateModal} icon={<RiAddLine className="h-4 w-4" />}>
              추가
            </PrimaryButton>
          </>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Table columns={columns} data={shown} loading={loading} emptyMessage="해당 블로그 없음" />
      </div>

      <BlogFormModal
        open={formState.open}
        mode={formState.mode}
        blog={formState.blog}
        existingBlogs={blogs}
        submitting={submitting}
        onClose={closeFormModal}
        onSubmit={handleSubmitBlog}
      />
      <DeleteBlogModal
        open={deleteState.open}
        blog={deleteState.blog}
        submitting={actionLoadingId === deleteState.blog?.id}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteBlog}
      />
    </div>
  );
}

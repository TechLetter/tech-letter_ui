import { useState, useEffect, useCallback } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiRefreshLine,
} from "react-icons/ri";
import Table from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import Badge from "../../../components/common/Badge";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  handleAdminError,
  updateBlog,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { useUrlState } from "../../../hooks/useUrlState";
import { formatKSTDateTime } from "../../../utils/timeutils";
import BlogFormModal from "./BlogFormModal";
import DeleteBlogModal from "./DeleteBlogModal";

export default function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [formState, setFormState] = useState({
    open: false,
    mode: "create",
    blog: null,
  });
  const [deleteState, setDeleteState] = useState({ open: false, blog: null });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [page, setPage] = useUrlState("blogPage", 1, { parse: Number });

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogs({ page, page_size: pageSize });
      setBlogs(data.items || []);
      setTotalPages(data.total_pages || 0);
      setTotalCount(data.total || 0);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

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
      width: "220px",
      render: (name, row) => (
        <div className="space-y-1">
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
          >
            <span className="truncate">{name}</span>
            <RiExternalLinkLine className="flex-shrink-0 text-slate-400" />
          </a>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {row.url}
          </div>
        </div>
      ),
    },
    {
      key: "rss_url",
      label: "RSS",
      width: "280px",
      render: (rssUrl) => (
        <a
          href={rssUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span className="truncate">{rssUrl}</span>
          <RiExternalLinkLine className="flex-shrink-0" />
        </a>
      ),
    },
    {
      key: "blog_type",
      label: "유형",
      width: "110px",
      render: (blogType) => (
        <Badge variant={blogType === "creator" ? "info" : "neutral"}>
          {blogType === "creator" ? "크리에이터" : "회사"}
        </Badge>
      ),
    },
    {
      key: "post_count",
      label: "포스트",
      width: "90px",
      align: "right",
      render: (postCount) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {(postCount || 0).toLocaleString()}개
        </span>
      ),
    },
    {
      key: "is_active",
      label: "수집",
      width: "90px",
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "warning"}>
          {isActive ? "활성" : "중지"}
        </Badge>
      ),
    },
    {
      key: "last_fetched_at",
      label: "최근 수집",
      width: "170px",
      render: (lastFetchedAt, row) => (
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div>{lastFetchedAt ? formatKSTDateTime(lastFetchedAt) : "-"}</div>
          {row.last_fetch_error && (
            <div className="line-clamp-2 text-red-500 dark:text-red-400">
              {row.last_fetch_error}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "id",
      label: "ID",
      width: "180px",
      className: "hidden lg:block",
      render: (id) => (
        <code className="block max-w-[160px] truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {id}
        </code>
      ),
    },
    {
      key: "actions",
      label: "작업",
      width: "120px",
      align: "right",
      sticky: "right",
      render: (_, row) => {
        const isLoading = actionLoadingId === row.id;
        return (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              disabled={isLoading}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              title="수정"
            >
              <RiEditLine />
            </button>
            <button
              type="button"
              onClick={() => openDeleteModal(row)}
              disabled={isLoading}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="삭제"
            >
              <RiDeleteBinLine />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            블로그 관리
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            총 {totalCount.toLocaleString()}개
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RiRefreshLine className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <RiAddLine />
            추가
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Table
          columns={columns}
          data={blogs}
          loading={loading}
          emptyMessage="등록된 블로그가 없습니다."
        />
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

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

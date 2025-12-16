import { useState, useEffect, useCallback } from "react";
import { RiRefreshLine, RiExternalLinkLine } from "react-icons/ri";
import Table from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import { getBlogs, handleAdminError } from "../../../api/adminApi";
import { showToast } from "../../../provider/ToastModalProvider";
import { useUrlState } from "../../../hooks/useUrlState";

export default function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // URL 동기화되는 페이지 상태
  const [page, setPage] = useUrlState("blogPage", 1, { parse: Number });

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogs({ page, page_size: pageSize });
      setBlogs(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const columns = [
    {
      key: "name",
      label: "블로그명",
      render: (name) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {name}
        </span>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (url) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span className="truncate max-w-[300px]">{url}</span>
          <RiExternalLinkLine className="flex-shrink-0" />
        </a>
      ),
    },
    {
      key: "id",
      label: "ID",
      width: "200px",
      render: (id) => (
        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-400">
          {id}
        </code>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          블로그 관리
        </h2>
        <button
          onClick={fetchBlogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RiRefreshLine className={loading ? "animate-spin" : ""} />
          새로고침
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <Table
          columns={columns}
          data={blogs}
          loading={loading}
          emptyMessage="등록된 블로그가 없습니다."
        />
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

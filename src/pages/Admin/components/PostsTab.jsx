import { useState, useEffect, useCallback } from "react";
import {
  RiRefreshLine,
  RiDeleteBinLine,
  RiSparklingLine,
  RiDatabase2Line,
  RiAddLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Pagination from "../../../components/common/Pagination";
import {
  getPosts,
  getBlogs,
  deletePost,
  triggerSummarize,
  triggerEmbed,
  handleAdminError,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/ToastModalProvider";
import { formatKSTDateTime } from "../../../utils/timeutils";
import { useUrlState, parseBool } from "../../../hooks/useUrlState";
import CreatePostModal from "./CreatePostModal";

export default function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // URL 동기화되는 필터/페이지 상태
  const [page, setPage] = useUrlState("page", 1, { parse: Number });
  const [filterSummarized, setFilterSummarized] = useUrlState(
    "summarized",
    undefined,
    { parse: parseBool }
  );
  const [filterEmbedded, setFilterEmbedded] = useUrlState(
    "embedded",
    undefined,
    { parse: parseBool }
  );
  const [filterBlogId, setFilterBlogId] = useUrlState("blog", "");

  // 블로그 목록 (필터 드롭다운용)
  const [blogs, setBlogs] = useState([]);

  // 블로그 목록 로드 (최초 1회)
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await getBlogs({ page: 1, page_size: 100 });
        setBlogs(data.data || []);
      } catch (error) {
        // 블로그 로드 실패 시 무시 (필터만 비활성화됨)
      }
    };
    loadBlogs();
  }, []);

  // 포스트 목록 조회
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosts({
        page,
        page_size: pageSize,
        status_ai_summarized: filterSummarized,
        status_embedded: filterEmbedded,
        blog_id: filterBlogId || undefined,
      });
      setPosts(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      setTotalCount(data.total || 0);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterSummarized, filterEmbedded, filterBlogId]);

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

  // 테이블 컬럼 정의
  const columns = [
    {
      key: "id",
      label: "ID",
      width: "180px",
      render: (id) => (
        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded truncate block max-w-[160px]">
          {id}
        </code>
      ),
    },
    {
      key: "title",
      label: "제목",
      width: "300px",
      render: (title, row) => (
        <div className="space-y-1">
          <a
            href={row.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-1 group"
          >
            <span className="line-clamp-1">{title}</span>
            <RiExternalLinkLine className="text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
          </a>
          <div className="text-xs text-slate-500">{row.blog_name || "-"}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "상태",
      width: "250px",
      render: (status, row) => (
        <div className="flex flex-col gap-1.5">
          <Badge variant={status?.ai_summarized ? "success" : "warning"}>
            {status?.ai_summarized ? (
              <span>요약 완료 {row.aisummary.model_name}</span>
            ) : (
              "요약 대기"
            )}
          </Badge>
          <Badge variant={status?.embedded ? "success" : "warning"}>
            {status?.embedded ? (
              <span>임베딩 완료 {row.embedding.model_name}</span>
            ) : (
              "임베딩 대기"
            )}
          </Badge>
        </div>
      ),
    },
    {
      key: "timestamps",
      label: "시간 정보",
      width: "180px",
      render: (_, row) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <div>생성: {formatKSTDateTime(row.created_at)}</div>
          {row.aisummary?.generated_at && (
            <div>요약: {formatKSTDateTime(row.aisummary.generated_at)}</div>
          )}
          {row.embedding?.embedded_at && (
            <div>임베딩: {formatKSTDateTime(row.embedding.embedded_at)}</div>
          )}
        </div>
      ),
    },

    {
      key: "actions",
      label: "",
      width: "140px",
      align: "right",
      render: (_, row) => {
        const isThisRowLoading = actionLoading?.id === row.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSummarize(row);
              }}
              disabled={isThisRowLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
              title="AI 요약 트리거"
            >
              <RiSparklingLine className="text-base" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEmbed(row);
              }}
              disabled={isThisRowLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              title="임베딩 트리거"
            >
              <RiDatabase2Line className="text-base" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              disabled={isThisRowLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="삭제"
            >
              <RiDeleteBinLine className="text-base" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">포스트 관리</h2>
          <span className="text-sm text-slate-500">
            총{" "}
            <span className="font-medium text-slate-700">
              {totalCount.toLocaleString()}
            </span>
            건
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 블로그 필터 */}
          <select
            value={filterBlogId}
            onChange={(e) => {
              setFilterBlogId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">블로그: 전체</option>
            {blogs.map((blog) => (
              <option key={blog.id} value={blog.id}>
                {blog.name} ({blog.url})
              </option>
            ))}
          </select>
          {/* 요약/임베딩 필터 */}
          <select
            value={
              filterSummarized === undefined ? "" : filterSummarized.toString()
            }
            onChange={(e) => {
              const val = e.target.value;
              setFilterSummarized(val === "" ? undefined : val === "true");
              setPage(1); // 필터 변경 시 첫 페이지로
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">요약 상태: 전체</option>
            <option value="true">요약 완료</option>
            <option value="false">요약 대기</option>
          </select>
          <select
            value={
              filterEmbedded === undefined ? "" : filterEmbedded.toString()
            }
            onChange={(e) => {
              const val = e.target.value;
              setFilterEmbedded(val === "" ? undefined : val === "true");
              setPage(1); // 필터 변경 시 첫 페이지로
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">임베딩 상태: 전체</option>
            <option value="true">임베딩 완료</option>
            <option value="false">임베딩 대기</option>
          </select>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RiRefreshLine className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <RiAddLine />
            포스트 추가
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          columns={columns}
          data={posts}
          loading={loading}
          emptyMessage="등록된 포스트가 없습니다."
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

      {/* 생성 모달 */}
      <CreatePostModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handlePostCreated}
      />
    </div>
  );
}

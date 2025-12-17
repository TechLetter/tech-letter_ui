import { useState, useEffect, useCallback } from "react";
import { RiRefreshLine } from "react-icons/ri";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Pagination from "../../../components/common/Pagination";
import { getUsers, handleAdminError } from "../../../api/adminApi";
import { showToast } from "../../../provider/ToastModalProvider";
import timeutils from "../../../utils/timeutils";
import { useUrlState } from "../../../hooks/useUrlState";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // URL 동기화되는 페이지 상태
  const [page, setPage] = useUrlState("userPage", 1, { parse: Number });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({ page, page_size: pageSize });
      setUsers(data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      key: "name",
      label: "이름",
      width: "150px",
      render: (name) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {name || "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: "이메일",
      width: "200px",
      render: (email) => (
        <span className="text-slate-600 dark:text-slate-300">{email}</span>
      ),
    },
    { key: "user_code", label: "사용자코드" },
    {
      key: "role",
      label: "역할",
      width: "100px",
      align: "center",
      render: (role) => (
        <Badge variant={role === "admin" ? "info" : "neutral"}>
          {role === "admin" ? "관리자" : "사용자"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "가입일",
      width: "120px",
      render: (date) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {timeutils.formatLocalDate(date)}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "수정일",
      width: "120px",
      render: (date) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {timeutils.formatLocalDate(date)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          사용자 관리
        </h2>
        <button
          onClick={fetchUsers}
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
          data={users}
          loading={loading}
          emptyMessage="등록된 사용자가 없습니다."
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

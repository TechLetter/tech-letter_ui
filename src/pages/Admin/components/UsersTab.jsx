import { useState, useEffect, useCallback } from "react";
import { RiRefreshLine, RiCoinLine } from "react-icons/ri";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Pagination from "../../../components/common/Pagination";
import { getUsers, grantCredit, handleAdminError } from "../../../api/adminApi";
import { showToast } from "../../../provider/ToastModalProvider";
import timeutils from "../../../utils/timeutils";
import { useUrlState } from "../../../hooks/useUrlState";
import GrantCreditModal from "./GrantCreditModal";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // URL 동기화되는 페이지 상태
  const [page, setPage] = useUrlState("userPage", 1, { parse: Number });

  // 크레딧 지급 모달 상태
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleGrantCredit = useCallback((user) => {
    setSelectedUser(user);
    setShowGrantModal(true);
  }, []);

  const handleGrantSubmit = useCallback(
    async (amount, expiresAt) => {
      try {
        await grantCredit(selectedUser.user_code, {
          amount,
          expired_at: expiresAt,
        });
        showToast(
          `${selectedUser.name}에게 크레딧 ${amount}개를 지급했습니다.`,
          "success"
        );
        fetchUsers(); // 목록 새로고침
      } catch (error) {
        throw new Error(handleAdminError(error));
      }
    },
    [selectedUser, fetchUsers]
  );

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
      key: "credits",
      label: "크레딧",
      width: "100px",
      align: "center",
      render: (credits) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
          <RiCoinLine />
          {credits ?? 0}
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
    {
      key: "actions",
      label: "액션",
      width: "100px",
      align: "center",
      render: (_, user) => (
        <button
          onClick={() => handleGrantCredit(user)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          <RiCoinLine />
          지급
        </button>
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

      {/* 크레딧 지급 모달 */}
      <GrantCreditModal
        isOpen={showGrantModal}
        user={selectedUser}
        onClose={() => setShowGrantModal(false)}
        onSubmit={handleGrantSubmit}
      />
    </div>
  );
}

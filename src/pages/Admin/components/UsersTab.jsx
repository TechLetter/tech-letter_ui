import { useState, useEffect, useCallback } from "react";
import { RiCoinLine, RiShieldUserLine } from "react-icons/ri";
import Table from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import { getUsers, grantCredit, handleAdminError } from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { useUrlState } from "../../../hooks/useUrlState";
import { RefreshButton, RelTime } from "./AdminKit";
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
      setTotalPages(data.total_pages || 0);
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
          expires_at: expiresAt,
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
      width: "180px",
      render: (name, user) => (
        <span className="flex min-w-0 items-center gap-1.5" title={user.user_code}>
          <span className="truncate font-medium text-slate-900 dark:text-slate-100">{name || "-"}</span>
          {user.role === "admin" && (
            <RiShieldUserLine aria-label="관리자" className="h-4 w-4 shrink-0 text-indigo-500" />
          )}
        </span>
      ),
    },
    {
      key: "email",
      label: "이메일",
      render: (email) => <span className="truncate text-slate-600 dark:text-slate-300">{email}</span>,
    },
    {
      key: "credits",
      label: "크레딧",
      width: "72px",
      align: "right",
      render: (credits) => (
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${
            credits?.remaining ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <RiCoinLine className="h-3.5 w-3.5" />
          {credits?.remaining ?? 0}
        </span>
      ),
    },
    { key: "created_at", label: "가입", width: "84px", render: (iso) => <RelTime iso={iso} /> },
    {
      key: "actions",
      label: "",
      width: "72px",
      align: "right",
      sticky: "right",
      render: (_, user) => (
        <button
          type="button"
          onClick={() => handleGrantCredit(user)}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
          <RiCoinLine />
          지급
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <RefreshButton onClick={fetchUsers} loading={loading} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Table columns={columns} data={users} loading={loading} emptyMessage="사용자 없음" />
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <GrantCreditModal
        isOpen={showGrantModal}
        user={selectedUser}
        onClose={() => setShowGrantModal(false)}
        onSubmit={handleGrantSubmit}
      />
    </div>
  );
}

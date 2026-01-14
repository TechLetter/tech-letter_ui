import { useState } from "react";
import { RiCloseLine, RiCoinLine, RiCalendarLine } from "react-icons/ri";

/**
 * GrantCreditModal - 크레딧 지급 모달
 */
export default function GrantCreditModal({ isOpen, user, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amountNum = parseInt(amount, 10);
    if (!amount || amountNum < 1) {
      setError("지급 수량은 1 이상이어야 합니다.");
      return;
    }

    if (!expiresAt) {
      setError("만료일을 선택해주세요.");
      return;
    }

    const expiresDate = new Date(expiresAt);
    if (expiresDate <= new Date()) {
      setError("만료일은 현재 시각보다 미래여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const expiresAtISO = expiresDate.toISOString();
      await onSubmit(amountNum, expiresAtISO);
      setAmount("");
      setExpiresAt("");
      onClose();
    } catch (err) {
      setError(err.message || "크레딧 지급에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setAmount("");
    setExpiresAt("");
    setError("");
    onClose();
  };

  // 빠른 수량 버튼
  const quickAmounts = [10, 50, 100];

  // 빠른 만료일 옵션
  const getQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const quickDates = [
    { label: "1개월", days: 30 },
    { label: "3개월", days: 90 },
    { label: "6개월", days: 180 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* 헤더 - 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <RiCoinLine className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">크레딧 지급</h3>
                <p className="text-sm text-white/80">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>
        </div>

        {/* 폼 */}
        <div className="p-5 space-y-5">
          {/* 지급 수량 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              지급 수량
            </label>
            {/* 빠른 선택 버튼 */}
            <div className="flex gap-2 mb-3">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`
                    flex-1 py-2 rounded-xl text-sm font-medium transition-all
                    ${
                      amount === String(val)
                        ? "bg-indigo-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }
                  `}
                >
                  {val}개
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="relative">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                placeholder="직접 입력"
                className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 focus:outline-none disabled:opacity-50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                개
              </span>
            </div>
          </div>

          {/* 만료일 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              만료일
            </label>
            {/* 빠른 선택 버튼 */}
            <div className="flex gap-2 mb-3">
              {quickDates.map(({ label, days }) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpiresAt(getQuickDate(days))}
                  className={`
                    flex-1 py-2 rounded-xl text-sm font-medium transition-all
                    ${
                      expiresAt === getQuickDate(days)
                        ? "bg-indigo-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="relative">
              <RiCalendarLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                min={getQuickDate(1)}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 focus:outline-none disabled:opacity-50 transition-colors"
              />
            </div>
            {expiresAt && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                📅{" "}
                {new Date(expiresAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                까지 유효
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !amount || !expiresAt}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all"
            >
              {isSubmitting ? "지급 중..." : `${amount || 0}개 지급`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

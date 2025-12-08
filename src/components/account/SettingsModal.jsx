import { useState } from "react";
import { createPortal } from "react-dom";
import authApi from "../../api/authApi";

function SettingsModalContent({ open, onClose, onDeleted, user }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "정말 계정을 삭제하시겠어요?\n\n모든 북마크와 프로필 정보가 삭제되며, 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await authApi.deleteMe();
      // axios는 4xx를 예외로 던지므로, 404/401 도 여기로 떨어질 수 있다.
      // deleteMe 호출이 성공적으로 끝났다고 판단되면 상위에서 로그아웃 및 리다이렉트 처리.
      onDeleted();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 401) {
        // 이미 탈퇴된 계정 / 세션 만료 등은 클라이언트 입장에서는 동일하게 로그아웃 처리
        onDeleted();
        return;
      }
      setError("계정 삭제 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user?.name || "";
  const userEmail = user?.email || "";

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-3xl max-h-[80vh] rounded-2xl bg-white shadow-xl flex overflow-hidden px-4 sm:px-0">
        {/* 사이드 네비 (향후 확장용) */}
        <aside className="w-48 border-r border-gray-100 bg-slate-50/80 py-4 px-3 text-sm">
          <div className="mb-4 px-2 text-xs font-semibold text-gray-500">
            설정
          </div>
          <button
            type="button"
            className="flex w-full items-center rounded-lg hover:bg-gray-100 px-3 py-2 text-xs font-medium text-gray-900"
          >
            <span>계정 설정</span>
          </button>
        </aside>

        {/* 메인 컨텐츠 */}
        <section className="flex-1 p-6 text-sm text-gray-900 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                계정 설정
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                프로필과 계정 관련 설정을 관리할 수 있어요.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-slate-50/60 px-4 py-3 mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {userName ? userName.charAt(0).toUpperCase() : ""}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
          </div>

          {/* 위험 영역 */}
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-4">
            <h3 className="text-sm font-semibold text-red-700">회원 탈퇴</h3>
            <p className="mt-1 text-xs text-red-600">
              회원을 탈퇴하면 Tech Letter 에 저장된 프로필과 북마크 정보가 모두
              삭제되며, 다시 복구할 수 없습니다.
            </p>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? "삭제 중..." : "계정 삭제"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsModal(props) {
  const { open } = props;
  if (!open) return null;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(<SettingsModalContent {...props} />, document.body);
}

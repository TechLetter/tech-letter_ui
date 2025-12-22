import { RiAlertLine, RiCloseLine } from "react-icons/ri";

/**
 * InsufficientCreditsModal - 크레딧 부족 안내 모달
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {function} props.onClose - 닫기 핸들러
 */
export default function InsufficientCreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-fadeIn">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <RiCloseLine className="text-xl" />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <RiAlertLine className="text-3xl text-amber-500" />
          </div>
        </div>

        {/* 메시지 */}
        <h3 className="text-lg font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
          크레딧이 부족합니다
        </h3>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
          채팅을 계속하려면 크레딧이 필요합니다.
          <br />
          관리자에게 문의하거나 잠시 후 다시 시도해 주세요.
        </p>

        {/* 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
}

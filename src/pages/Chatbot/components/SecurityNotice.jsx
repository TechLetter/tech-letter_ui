import { RiShieldCheckLine } from "react-icons/ri";
import { ErrorCode } from "../../../api/apiError";

export default function SecurityNotice({ guard, error }) {
  const isPolicyBlocked = error?.code === ErrorCode.POLICY_BLOCKED;
  const showSanitized = guard?.action === "sanitize";

  if (!isPolicyBlocked && !showSanitized) return null;

  const message = isPolicyBlocked
    ? "요청에 내부 지시 변경 또는 민감 정보 요청으로 해석될 수 있는 내용이 포함되어 처리하지 않았습니다."
    : guard.message || "일부 지시성 문구를 제외하고 질문을 처리했습니다.";

  return (
    <div className="my-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
      <RiShieldCheckLine className="mt-0.5 flex-shrink-0 text-lg" />
      <div>
        <div className="font-semibold">안전 정책 적용</div>
        <div className="mt-1">{message}</div>
      </div>
    </div>
  );
}

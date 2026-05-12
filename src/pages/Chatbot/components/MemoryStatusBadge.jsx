import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiTimeLine,
} from "react-icons/ri";

const getMemoryStatus = (memory) => {
  if (!memory?.used) {
    return {
      icon: RiTimeLine,
      label: "새 질문",
      description: "이전 대화 맥락 없이 답변했습니다.",
      tone: "slate",
    };
  }

  if (memory.status === "pending" && memory.compressed) {
    return {
      icon: RiTimeLine,
      label: "기존 요약 반영",
      description:
        "기존 대화 요약과 최근 메시지를 참고했고, 새 요약은 백그라운드에서 갱신 중입니다.",
      tone: "amber",
    };
  }

  if (memory.status === "pending") {
    return {
      icon: RiTimeLine,
      label: "요약 생성 중",
      description:
        "최근 대화만 참고하고, 긴 대화 요약은 백그라운드에서 생성 중입니다.",
      tone: "amber",
    };
  }

  if (memory.compression_failed && memory.compressed) {
    return {
      icon: RiErrorWarningLine,
      label: "기존 요약 반영",
      description:
        "새 요약 갱신은 실패했지만 기존 대화 요약과 최근 메시지를 참고했습니다.",
      tone: "amber",
    };
  }

  if (memory.compression_failed) {
    return {
      icon: RiErrorWarningLine,
      label: "최근 대화만 반영",
      description:
        "긴 대화 요약을 만들지 못해 최근 메시지만 참고했습니다.",
      tone: "amber",
    };
  }

  if (memory.compressed) {
    return {
      icon: RiCheckboxCircleLine,
      label: "긴 대화 요약 반영",
      description: `이전 대화 요약과 최근 메시지 ${memory.recent_message_count}개를 함께 참고했습니다.`,
      tone: "emerald",
    };
  }

  return {
    icon: RiCheckboxCircleLine,
    label: "이전 대화 반영",
    description: `최근 메시지 ${memory.recent_message_count}개를 참고했습니다.`,
    tone: "indigo",
  };
};

const toneClassNames = {
  slate:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300",
  indigo:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
};

export default function MemoryStatusBadge({ memory }) {
  if (!memory) return null;

  const status = getMemoryStatus(memory);
  const Icon = status.icon;

  return (
    <div
      className={`inline-flex max-w-full items-start gap-2 rounded-lg border px-3 py-2 text-xs ${toneClassNames[status.tone]}`}
      title={status.description}
    >
      <Icon className="mt-0.5 flex-shrink-0 text-base" />
      <div className="min-w-0">
        <div className="font-semibold">{status.label}</div>
        <div className="mt-0.5 text-[11px] opacity-80">{status.description}</div>
      </div>
    </div>
  );
}

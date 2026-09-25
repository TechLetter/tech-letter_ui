import { RiImageLine, RiMicLine, RiVideoLine } from "react-icons/ri";

const ICON_CLASS = "h-3.5 w-3.5";
const ICONS = [
  ["image", <RiImageLine className={ICON_CLASS} />, "이미지 입력"],
  ["audio", <RiMicLine className={ICON_CLASS} />, "오디오 입력"],
  ["video", <RiVideoLine className={ICON_CLASS} />, "비디오 입력"],
];

/** 텍스트 말고 받을 수 있는 입력. 텍스트는 모든 모델이 받아서 그리지 않는다. */
export default function ModalityIcons({ modalities = [] }) {
  const shown = ICONS.filter(([kind]) => modalities.includes(kind));
  if (shown.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
      {shown.map(([kind, icon, label]) => (
        <span key={kind} role="img" aria-label={label} title={label}>
          {icon}
        </span>
      ))}
    </span>
  );
}

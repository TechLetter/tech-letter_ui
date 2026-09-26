import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? "라이트 모드" : "다크 모드"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:bg-canvas"
    >
      {isDarkMode ? <RiSunLine className="h-[18px] w-[18px]" /> : <RiMoonLine className="h-[18px] w-[18px]" />}
    </button>
  );
}

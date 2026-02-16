import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${
        isDarkMode
          ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <RiSunLine className="text-xl" />
      ) : (
        <RiMoonLine className="text-xl" />
      )}
    </button>
  );
}

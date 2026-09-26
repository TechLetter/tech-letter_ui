import { NavLink, useNavigate } from "react-router-dom";
import { RiChat3Line } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import { useAuth } from "../../hooks/useAuth";
import { useChatbotEntry } from "../../hooks/useChatbotEntry";
import UserProfileMenu from "../auth/UserProfileMenu";
import ThemeToggle from "../common/ThemeToggle";
import Logo from "./Logo";

const NAV = [
  { to: PATHS.HOME, label: "홈", end: true },
  { to: PATHS.TRENDS, label: "트렌드" },
  { to: PATHS.MODEL_STATUS, label: "모델" },
  { to: PATHS.BOOKMARKS, label: "북마크" },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialized, logout, isAdmin } = useAuth();
  const goChatbot = useChatbotEntry();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-(--tl-header-h) border-b border-line bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1360px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="주요 메뉴" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex h-9 items-center rounded-lg px-3 text-[15px] ${
                  isActive
                    ? "bg-canvas font-semibold text-ink"
                    : "font-medium text-ink-2 hover:bg-canvas hover:text-ink"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />
        {/* 검색 자리 — 구현 전까지 비워 둔다. */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goChatbot}
            className="hidden h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-semibold text-accent-fg hover:opacity-90 lg:flex"
          >
            <RiChat3Line className="h-[18px] w-[18px]" />
            챗봇
          </button>
          <ThemeToggle />
          {!initialized && (
            <div className="hidden h-9 w-9 animate-pulse rounded-lg bg-canvas lg:block" />
          )}
          {initialized && isAuthenticated && (
            <div className="hidden lg:block">
              <UserProfileMenu user={user} isAdmin={isAdmin} onLogout={logout} />
            </div>
          )}
          {initialized && !isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate(PATHS.LOGIN)}
              className="hidden h-9 items-center rounded-lg border border-ink px-4 text-sm font-semibold text-ink hover:bg-canvas lg:flex"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

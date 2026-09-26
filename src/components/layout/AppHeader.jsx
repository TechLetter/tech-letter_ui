import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RiChat3Line, RiCloseLine, RiSearchLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import { useAuth } from "../../hooks/useAuth";
import { useChatbotEntry } from "../../hooks/useChatbotEntry";
import { useLoginGate } from "../../hooks/useLoginGate";
import { openSearch } from "../../provider/searchOverlayBridge";
import UserProfileMenu from "../auth/UserProfileMenu";
import ThemeToggle from "../common/ThemeToggle";
import Logo from "./Logo";

const NAV = [
  { to: PATHS.HOME, label: "홈", end: true },
  { to: PATHS.TRENDS, label: "트렌드" },
  { to: PATHS.MODEL_STATUS, label: "모델" },
  { to: PATHS.BOOKMARKS, label: "북마크", needsLogin: true },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialized, logout, isAdmin } = useAuth();
  const goChatbot = useChatbotEntry();
  const gate = useLoginGate();
  // 홈 결과 상태면 슬롯에 검색어를 보여 주고, 팔레트도 그 검색어로 연다.
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = pathname === PATHS.HOME ? (searchParams.get("q") || "").trim() : "";
  const clearQuery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-(--tl-header-h) border-b border-line bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1360px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="주요 메뉴" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ to, label, end, needsLogin }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(event) => {
                // 비로그인이면 이동하지 않고 로그인 모달부터.
                if (needsLogin && !gate()) event.preventDefault();
              }}
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

        <div className="flex items-center gap-2">
          <div
            role="search"
            className={`hidden h-9 w-[280px] items-center gap-2 rounded-lg border pl-3 text-sm lg:flex ${
              currentQuery ? "border-accent bg-surface pr-1" : "border-line bg-canvas pr-3 hover:border-slate-300 dark:hover:border-slate-500"
            }`}
          >
            <button
              type="button"
              onClick={() => openSearch(currentQuery)}
              className={`flex h-full min-w-0 flex-1 items-center gap-2 ${currentQuery ? "text-ink" : "text-ink-3"}`}
            >
              <RiSearchLine className={`h-4 w-4 shrink-0 ${currentQuery ? "text-accent-ink" : ""}`} />
              <span className={`min-w-0 flex-1 truncate text-left ${currentQuery ? "font-semibold" : ""}`}>{currentQuery || "검색"}</span>
              {!currentQuery && <kbd className="rounded border border-line bg-surface px-1.5 py-px font-mono text-[11px]">⌘K</kbd>}
            </button>
            {currentQuery && (
              <button
                type="button"
                aria-label="검색 지우기"
                onClick={clearQuery}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="검색"
            onClick={() => openSearch(currentQuery)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 hover:bg-canvas lg:hidden"
          >
            <RiSearchLine className="h-5 w-5" />
          </button>
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

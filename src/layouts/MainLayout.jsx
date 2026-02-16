import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { PATHS } from "../routes/path";
import { useAuth } from "../hooks/useAuth";
import UserProfileMenu from "../components/auth/UserProfileMenu";
import { showLoginRequiredModal } from "../provider/loginRequiredModalBridge";
import ThemeToggle from "../components/common/ThemeToggle";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialized, logout, isAdmin } = useAuth();

  // 정보 메뉴 상태
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleClick = () => {
    navigate(PATHS.HOME);
  };

  const handleLoginClick = () => {
    navigate(PATHS.LOGIN);
  };

  const handleLogoutClick = () => {
    logout();
  };

  const isLoadingUser = !initialized;
  const isAuthenticatedUser = initialized && isAuthenticated;
  const isGuest = initialized && !isAuthenticated;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-full sm:max-w-2xl lg:max-w-7xl transition-colors duration-300">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 backdrop-blur-lg transition-colors duration-300">
        <div className="w-full max-w-full sm:max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTitleClick}
            className="text-left focus:outline-none flex-shrink-0"
          >
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tech Letter
            </div>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                if (!isAuthenticatedUser) {
                  showLoginRequiredModal();
                } else {
                  navigate(PATHS.CHATBOT);
                }
              }}
              className="group focus:outline-none"
            >
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-800/40 dark:group-hover:to-purple-800/40 transition-colors border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
                <RiRobot2Line className="text-lg group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI 챗봇
                </span>
              </div>
            </button>
            {isLoadingUser && (
              <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            {isAuthenticatedUser && (
              <UserProfileMenu
                user={user}
                isAdmin={isAdmin}
                onLogout={handleLogoutClick}
              />
            )}
            {isGuest && (
              <button
                type="button"
                onClick={handleLoginClick}
                className="rounded-full bg-indigo-600 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 whitespace-nowrap"
              >
                로그인
              </button>
            )}

            {/* 정보 메뉴 (모바일/데스크톱 모두 접근 가능) */}
            <div className="relative" ref={infoRef}>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="sr-only">정보</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>

              {infoOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 focus:outline-none z-50 p-1">
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        navigate(PATHS.PRIVACY);
                        setInfoOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      개인정보처리방침
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="pt-14 pb-6 px-2 sm:px-6 lg:px-8 min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Tech Letter. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(PATHS.PRIVACY)}
              className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
              개인정보처리방침
            </button>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}

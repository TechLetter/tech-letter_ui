import { Outlet, useNavigate } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { PATHS } from "../routes/path";
import { useAuth } from "../provider/AuthProvider";
import UserProfileMenu from "../components/auth/UserProfileMenu";
import { showLoginRequiredModal } from "../provider/LoginRequiredModalProvider";
import ThemeToggle from "../components/common/ThemeToggle";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialized, logout, isAdmin } = useAuth();

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
            className="text-left focus:outline-none"
          >
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tech Letter
            </div>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                if (!isAuthenticatedUser) {
                  showLoginRequiredModal();
                } else {
                  navigate(PATHS.CHATBOT);
                }
              }}
              className="group mr-2 focus:outline-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-800/40 dark:group-hover:to-purple-800/40 transition-colors border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
                <RiRobot2Line className="text-lg group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
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
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="pt-14 pb-6 px-2 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <ScrollToTopButton />
    </div>
  );
}

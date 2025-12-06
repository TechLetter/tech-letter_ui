import { Outlet, useNavigate } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { PATHS } from "../routes/path";
import { useAuth } from "../provider/AuthProvider";
import UserProfileMenu from "../components/auth/UserProfileMenu";

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
    <div className="relative mx-auto min-h-screen w-full max-w-full sm:max-w-2xl lg:max-w-7xl">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-lg">
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
          {/* 우측 인증 영역 */}
          <div className="flex items-center gap-3">
            {isLoadingUser && (
              <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
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
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <ScrollToTopButton />
    </div>
  );
}

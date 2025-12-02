import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function MainLayout() {
  return (
    <div className="w-full max-w-full sm:max-w-2xl lg:max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      {/* 헤더 */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-sm cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <div className="w-full max-w-full sm:max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tech Letter
          </div>
          {/* 필요시 우측 메뉴 추가 가능 */}
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

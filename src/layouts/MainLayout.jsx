import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function MainLayout() {
  return (
    <div className="w-[420px] mx-auto bg-gray-50 min-h-screen relative">
      {/* 헤더 */}
      <header
        className="fixed px-[24px] top-0 w-[420px] h-[50px] bg-white flex items-center justify-between px-4 shadow z-50 cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <div className="text-[20px] font-bold font-sans">Tech Letter</div>
        {/* <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div> */}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="pt-[65px] pb-[20px] px-4">
        <Outlet />
      </main>

      {/* 푸터 */}
      {/* <footer className="fixed bottom-0 w-[420px] h-[30px] bg-white flex justify-around items-center border-t border-gray-300 z-50">
        <div className="w-[10px] h-[10px] bg-gray-300 rounded-full"></div>
        <div className="w-[10px] h-[10px] bg-gray-300 rounded-full"></div>
        <div className="w-[10px] h-[10px] bg-gray-300 rounded-full"></div>
      </footer> */}
      <ScrollToTopButton />
    </div>
  );
}

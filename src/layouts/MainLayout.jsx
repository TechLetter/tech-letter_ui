import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AppFooter from "../components/layout/AppFooter";
import AppHeader from "../components/layout/AppHeader";
import MobileTabBar from "../components/layout/MobileTabBar";
import MoreSheet from "../components/layout/MoreSheet";
import { PATHS } from "../routes/path";

export default function MainLayout() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  // 챗봇은 화면 전체를 쓰는 페이지라 푸터·하단 탭을 숨긴다.
  const isChatbot = pathname === PATHS.CHATBOT;

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main
        className={`mx-auto w-full max-w-[1360px] flex-1 px-4 pt-(--tl-header-h) sm:px-6 lg:px-8 ${
          isChatbot ? "" : "pb-24 lg:pb-10"
        }`}
      >
        <div className={isChatbot ? "" : "pt-4 lg:pt-6"}>
          <Outlet />
        </div>
      </main>
      {!isChatbot && <AppFooter />}
      {!isChatbot && <MobileTabBar moreOpen={moreOpen} onMore={() => setMoreOpen(true)} />}
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      {!isChatbot && <ScrollToTopButton />}
    </div>
  );
}

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    visible && (
      <button
        type="button"
        aria-label="맨 위로"
        onClick={scrollToTop}
        // 모바일은 하단 탭바(4rem + 아이폰 홈 인디케이터 여백) 위에 띄운다 — 여백을 빼면 탭바와 겹쳤다.
        className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg transition hover:bg-canvas lg:bottom-4"
      >
        <FaArrowUp size={14} aria-hidden="true" />
      </button>
    )
  );
}

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
        onClick={scrollToTop}
        className="fixed z-2 bg-white cursor-pointer bottom-4 right-4 w-[42px] h-[42px] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:shadow-slate-900/50"
      >
        <FaArrowUp
          size={14}
          className="text-slate-900 dark:text-slate-200"
        />
      </button>
    )
  );
}

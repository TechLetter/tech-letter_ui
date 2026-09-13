import { useEffect, useRef, useState } from "react";
import {
  bindToastModalHandler,
  unbindToastModalHandler,
} from "./toastModalBridge";

const TOAST_CLASSES = {
  info: "bg-white text-black dark:bg-slate-800 dark:text-slate-100",
  success: "bg-emerald-600 text-white dark:bg-emerald-500",
  error: "bg-red-600 text-white dark:bg-red-500",
};

const TOAST_DURATIONS = {
  info: 1500,
  success: 1500,
  error: 3000,
};

const normalizeVariant = (variant) =>
  variant === "success" || variant === "error" ? variant : "info";

export function ToastModalProvider() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");
  const [variant, setVariant] = useState("info");
  const hideTimerRef = useRef(null);

  useEffect(() => {
    bindToastModalHandler((message, nextVariant = "info") => {
      const safeVariant = normalizeVariant(nextVariant);
      setContent(message);
      setVariant(safeVariant);
      setVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(
        () => setVisible(false),
        TOAST_DURATIONS[safeVariant]
      );
    });

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      unbindToastModalHandler();
    };
  }, []);

  return visible ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`${TOAST_CLASSES[variant]} rounded px-6 py-3 shadow-xl opacity-0 animate-fade-in-out`}
        style={{ animationDuration: `${TOAST_DURATIONS[variant]}ms` }}
      >
        {content}
      </div>
    </div>
  ) : null;
}

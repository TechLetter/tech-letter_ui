import { useEffect, useRef, useState } from "react";
import {
  bindToastModalHandler,
  unbindToastModalHandler,
} from "./toastModalBridge";

export function ToastModalProvider() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");
  const hideTimerRef = useRef(null);

  useEffect(() => {
    bindToastModalHandler((message) => {
      setContent(message);
      setVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => setVisible(false), 1500);
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
      <div className="bg-white text-black px-6 py-3 rounded shadow-xl opacity-0 animate-fade-in-out">
        {content}
      </div>
    </div>
  ) : null;
}

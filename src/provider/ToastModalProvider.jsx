// ModalManager.js
import { useState, useEffect } from "react";

let showInternal = null;

export function ToastModalProvider() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    showInternal = (message) => {
      setContent(message);
      setVisible(true);
      setTimeout(() => setVisible(false), 1500);
    };
    return () => {
      showInternal = null;
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

export function showToast(message) {
  if (showInternal) showInternal(message);
}

import { useEffect } from "react";

/** 열려 있는 동안 Esc 로 닫는다. 모든 모달·시트의 기본 닫기 동작. */
export function useEscapeKey(active, onClose) {
  useEffect(() => {
    if (!active || !onClose) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onClose]);
}

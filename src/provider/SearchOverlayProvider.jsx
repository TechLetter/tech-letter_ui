import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PATHS } from "../routes/path";
import SearchOverlay from "../components/search/SearchOverlay";
import { bindSearchOverlayHandler, unbindSearchOverlayHandler } from "./searchOverlayBridge";

/** 검색 오버레이 하나를 앱 전체에서 공유한다. ⌘K / Ctrl+K 로도 연다. */
export function SearchOverlayProvider() {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const { pathname, search } = useLocation();

  useEffect(() => {
    bindSearchOverlayHandler((query = "") => {
      setInitialQuery(query);
      setOpen(true);
    });
    return () => unbindSearchOverlayHandler();
  }, []);

  // 화면이 바뀌면 닫는다 — 제안을 골라 이동했을 때.
  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        // 결과 화면이면 지금 검색어를 채워서 연다.
        const current = pathname === PATHS.HOME ? new URLSearchParams(search).get("q") || "" : "";
        setInitialQuery(current);
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pathname, search]);

  const close = useCallback(() => setOpen(false), []);

  if (!open) return null;
  return <SearchOverlay initialQuery={initialQuery} onClose={close} />;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBookmarkLine,
  RiLogoutBoxRLine,
  RiMoonLine,
  RiSettings3Line,
  RiShieldLine,
  RiShieldUserLine,
} from "react-icons/ri";
import { PATHS } from "../../routes/path";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import SettingsModal from "../account/SettingsModal";

const ROW =
  "flex h-12 w-full items-center gap-3 border-b border-line px-2 text-left text-[15px] font-medium text-ink last:border-b-0";
const ICON = "h-5 w-5 shrink-0 text-ink-3";

/** 모바일 '더보기' 시트 — 북마크·설정·다크 모드·개인정보처리방침·로그인/로그아웃. */
export default function MoreSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialized, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const userName = user?.name || "";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "";

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
          <section
            role="dialog"
            aria-label="더보기"
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex h-5 items-center justify-center">
              <span className="h-1 w-9 rounded-full bg-line" />
            </div>

            {initialized && isAuthenticated ? (
              <div className="flex items-center gap-3 border-b border-line px-2 pt-2 pb-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-base font-bold text-accent-ink">
                  {userInitial}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold text-ink">{userName}</span>
                  {user?.email && <span className="truncate text-xs text-ink-3">{user.email}</span>}
                </span>
              </div>
            ) : (
              <div className="border-b border-line px-2 pt-2 pb-4">
                <button
                  type="button"
                  onClick={() => go(PATHS.LOGIN)}
                  className="h-12 w-full rounded-xl border border-ink text-[15px] font-semibold text-ink"
                >
                  로그인
                </button>
              </div>
            )}

            {isAuthenticated && isAdmin && (
              <button type="button" onClick={() => go(PATHS.ADMIN)} className={ROW}>
                <RiShieldUserLine className={ICON} />
                관리자
              </button>
            )}
            {isAuthenticated && (
              <>
                <button type="button" onClick={() => go(PATHS.BOOKMARKS)} className={ROW}>
                  <RiBookmarkLine className={ICON} />
                  북마크
                </button>
                <button type="button" onClick={() => setSettingsOpen(true)} className={ROW}>
                  <RiSettings3Line className={ICON} />
                  설정
                </button>
              </>
            )}
            <div className={ROW}>
              <RiMoonLine className={ICON} />
              <span id="more-dark-mode" className="flex-1">
                다크 모드
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                aria-labelledby="more-dark-mode"
                onClick={toggleTheme}
                className={`relative h-[26px] w-11 rounded-full transition-colors ${
                  isDarkMode ? "bg-accent" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] ${
                    isDarkMode ? "left-[21px]" : "left-[3px]"
                  }`}
                />
              </button>
            </div>
            <button type="button" onClick={() => go(PATHS.PRIVACY)} className={ROW}>
              <RiShieldLine className={ICON} />
              개인정보처리방침
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className={`${ROW} text-ink-2`}
              >
                <RiLogoutBoxRLine className={ICON} />
                로그아웃
              </button>
            )}
          </section>
        </div>
      )}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDeleted={() => {
          setSettingsOpen(false);
          onClose();
          logout();
          navigate(PATHS.HOME);
        }}
        user={user}
      />
    </>
  );
}

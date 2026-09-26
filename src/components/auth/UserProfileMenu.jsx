import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiArrowDownSLine,
  RiBookmarkLine,
  RiLogoutBoxRLine,
  RiSettings3Line,
  RiShieldLine,
  RiShieldUserLine,
} from "react-icons/ri";
import { PATHS } from "../../routes/path";
import SettingsModal from "../account/SettingsModal";

const ITEM =
  "flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-ink hover:bg-canvas";
const ICON = "h-[18px] w-[18px] shrink-0 text-ink-3";

export default function UserProfileMenu({ user, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setOpen(false);
  };

  const handleAccountDeleted = () => {
    onLogout();
    setSettingsOpen(false);
    navigate(PATHS.HOME);
  };

  const userName = user?.name || "";
  const userEmail = user?.email || "";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="계정 메뉴"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface pr-1.5 pl-1 hover:bg-canvas"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-[13px] font-bold text-accent-ink">
          {userInitial}
        </span>
        <RiArrowDownSLine className="h-4 w-4 text-ink-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-lg dark:shadow-slate-950/60"
        >
          <div className="flex items-center gap-3 border-b border-line px-2.5 pt-2 pb-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent-ink">
              {userInitial}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-ink">{userName}</span>
              {userEmail && <span className="truncate text-xs text-ink-3">{userEmail}</span>}
            </span>
          </div>

          <div className="flex flex-col pt-1.5">
            {isAdmin && (
              <button type="button" role="menuitem" onClick={() => go(PATHS.ADMIN)} className={ITEM}>
                <RiShieldUserLine className={ICON} />
                관리자
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => go(PATHS.BOOKMARKS)} className={ITEM}>
              <RiBookmarkLine className={ICON} />
              북마크
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setSettingsOpen(true);
                setOpen(false);
              }}
              className={ITEM}
            >
              <RiSettings3Line className={ICON} />
              설정
            </button>
            <button type="button" role="menuitem" onClick={() => go(PATHS.PRIVACY)} className={ITEM}>
              <RiShieldLine className={ICON} />
              개인정보처리방침
            </button>
            <div className="my-1.5 h-px bg-line" />
            <button type="button" role="menuitem" onClick={handleLogoutClick} className={`${ITEM} text-ink-2`}>
              <RiLogoutBoxRLine className={ICON} />
              로그아웃
            </button>
          </div>
        </div>
      )}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDeleted={handleAccountDeleted}
        user={user}
      />
    </div>
  );
}

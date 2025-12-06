import { useEffect, useRef, useState } from "react";

export default function UserProfileMenu({ user, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const handleToggleOpen = () => {
    setOpen((prev) => !prev);
  };

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

  const handleLogoutClick = () => {
    onLogout();
    setOpen(false);
  };

  const userName = user?.name || "";
  const userEmail = user?.email || "";
  const userRoleLabel = isAdmin ? "관리자" : "사용자";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white shadow-sm">
          {userInitial}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium text-gray-900 truncate max-w-[140px]">
            {userName}
          </span>
          <span className="text-[10px] font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {userRoleLabel}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg shadow-indigo-100/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
              <p className="mt-0.5 text-[11px] text-indigo-600">
                {userRoleLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <span>로그아웃</span>
              <span className="text-[13px]">⟶</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { RiCloseLine, RiMenuLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import { ADMIN_TABS } from "./adminTabs";
import AdminSidebar from "./components/AdminSidebar";
import BlogsTab from "./components/BlogsTab";
import OpsTab from "./components/OpsTab";
import PostsTab from "./components/PostsTab";
import SettingsTab from "./components/SettingsTab";
import UsersTab from "./components/UsersTab";
import useAdminSummary from "./useAdminSummary";

const CONTENT = {
  posts: <PostsTab />,
  blogs: <BlogsTab />,
  users: <UsersTab />,
  ops: <OpsTab />,
  settings: <SettingsTab />,
};

/** 탭은 주소(`/admin/:tab`)에 둔다 — 새로고침해도 남고 링크로 바로 갈 수 있다. */
export default function Admin() {
  const { tab } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const summary = useAdminSummary(tab);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (!CONTENT[tab]) return <Navigate to={`${PATHS.ADMIN}/posts`} replace />;
  const label = ADMIN_TABS.find((item) => item.id === tab)?.label;
  const close = () => setDrawerOpen(false);

  return (
    <div className="w-full pt-2 lg:flex lg:items-start lg:gap-8 lg:pt-4">
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="관리 메뉴"
          aria-expanded={drawerOpen}
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RiMenuLine className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{label}</h1>
      </div>

      <aside className="hidden w-52 shrink-0 lg:sticky lg:top-[72px] lg:block">
        <AdminSidebar summary={summary} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/45" onClick={close} aria-hidden="true" />
          <aside
            aria-label="관리 메뉴"
            className="absolute inset-y-0 left-0 w-70 max-w-[85vw] overflow-y-auto bg-slate-50 px-4 pb-4 pt-2 shadow-xl dark:bg-slate-950"
          >
            <div className="mb-2 flex h-11 items-center justify-end">
              <button
                type="button"
                onClick={close}
                aria-label="닫기"
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebar summary={summary} onNavigate={close} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">{CONTENT[tab]}</main>
    </div>
  );
}

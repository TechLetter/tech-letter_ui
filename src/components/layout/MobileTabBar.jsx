import { NavLink } from "react-router-dom";
import { RiChat3Line, RiHome5Line, RiLineChartLine, RiMoreLine, RiPulseLine } from "react-icons/ri";
import { PATHS } from "../../routes/path";
import { useChatbotEntry } from "../../hooks/useChatbotEntry";

const TAB = "flex h-full flex-col items-center justify-center gap-1 text-[11px]";
const tabClass = (isActive) =>
  `${TAB} ${isActive ? "font-semibold text-accent-ink" : "font-medium text-ink-3 hover:text-ink"}`;

/** 모바일 하단 탭. lg 부터는 헤더 네비가 대신한다. */
export default function MobileTabBar({ moreOpen, onMore }) {
  const goChatbot = useChatbotEntry();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <NavLink to={PATHS.HOME} end className={({ isActive }) => tabClass(isActive)}>
        <RiHome5Line className="h-[22px] w-[22px]" />홈
      </NavLink>
      <NavLink to={PATHS.TRENDS} className={({ isActive }) => tabClass(isActive)}>
        <RiLineChartLine className="h-[22px] w-[22px]" />
        트렌드
      </NavLink>
      <button type="button" onClick={goChatbot} className={`${TAB} font-semibold text-accent-ink`}>
        <span className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-md shadow-indigo-500/30">
          <RiChat3Line className="h-[22px] w-[22px]" />
        </span>
        챗봇
      </button>
      <NavLink to={PATHS.MODEL_STATUS} className={({ isActive }) => tabClass(isActive)}>
        <RiPulseLine className="h-[22px] w-[22px]" />
        모델
      </NavLink>
      <button type="button" onClick={onMore} aria-expanded={moreOpen} className={tabClass(moreOpen)}>
        <RiMoreLine className="h-[22px] w-[22px]" />
        더보기
      </button>
    </nav>
  );
}

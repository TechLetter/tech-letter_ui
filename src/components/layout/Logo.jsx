import { Link } from "react-router-dom";
import { PATHS } from "../../routes/path";

/** 기존 아이콘(favicon)과 워드마크를 그대로 쓴다. */
export default function Logo() {
  return (
    <Link to={PATHS.HOME} aria-label="Tech Letter 홈" className="flex shrink-0 items-center gap-2">
      <img src="/tech-letter-favicon.svg" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent lg:text-xl">
        Tech Letter
      </span>
    </Link>
  );
}

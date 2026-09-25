import { RiBookOpenLine, RiFileTextLine, RiPulseLine, RiSettings3Line, RiUserLine } from "react-icons/ri";

/** 어드민 메뉴. 주소는 `/admin/<id>`. */
export const ADMIN_TABS = [
  { id: "posts", label: "포스트", icon: <RiFileTextLine className="h-4 w-4" /> },
  { id: "blogs", label: "블로그", icon: <RiBookOpenLine className="h-4 w-4" /> },
  { id: "users", label: "사용자", icon: <RiUserLine className="h-4 w-4" /> },
  { id: "ops", label: "운영", icon: <RiPulseLine className="h-4 w-4" /> },
  { id: "settings", label: "설정", icon: <RiSettings3Line className="h-4 w-4" /> },
];

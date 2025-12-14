import PropTypes from "prop-types";
import { RiFileTextLine, RiBookOpenLine, RiUserLine } from "react-icons/ri";

/**
 * Admin 페이지 탭 네비게이션
 */
const TABS = [
  { id: "posts", label: "포스트", icon: RiFileTextLine },
  { id: "blogs", label: "블로그", icon: RiBookOpenLine },
  { id: "users", label: "사용자", icon: RiUserLine },
];

export default function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="text-base" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

AdminTabs.propTypes = {
  activeTab: PropTypes.oneOf(["posts", "blogs", "users"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

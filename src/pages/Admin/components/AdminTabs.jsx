import PropTypes from "prop-types";
import {
  RiFileTextLine,
  RiBookOpenLine,
  RiQuestionAnswerLine,
  RiUserLine,
} from "react-icons/ri";

/**
 * Admin 페이지 탭 네비게이션
 */
const TABS = [
  { id: "posts", label: "포스트", icon: RiFileTextLine },
  { id: "blogs", label: "블로그", icon: RiBookOpenLine },
  { id: "users", label: "사용자", icon: RiUserLine },
  { id: "suggestedQuestions", label: "추천 질문", icon: RiQuestionAnswerLine },
];

export default function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
  activeTab: PropTypes.oneOf([
    "posts",
    "blogs",
    "users",
    "suggestedQuestions",
  ]).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

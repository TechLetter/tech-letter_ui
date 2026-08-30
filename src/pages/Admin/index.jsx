import { useState } from "react";
import AdminTabs from "./components/AdminTabs";
import PostsTab from "./components/PostsTab";
import BlogsTab from "./components/BlogsTab";
import UsersTab from "./components/UsersTab";
import SuggestedQuestionsTab from "./components/SuggestedQuestionsTab";
import OpsTab from "./components/OpsTab";
import LlmModelsTab from "./components/LlmModelsTab";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("posts");

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return <PostsTab />;
      case "blogs":
        return <BlogsTab />;
      case "users":
        return <UsersTab />;
      case "suggestedQuestions":
        return <SuggestedQuestionsTab />;
      case "ops":
        return <OpsTab />;
      case "llm":
        return <LlmModelsTab />;
      default:
        return <PostsTab />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            관리자 대시보드
          </h1>
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* 탭 콘텐츠 */}
        {renderTabContent()}
      </div>
    </div>
  );
}

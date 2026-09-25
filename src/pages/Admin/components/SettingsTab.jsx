import ModelPreferencesPanel from "./ModelPreferencesPanel";
import SuggestedQuestionsCard from "./SuggestedQuestionsCard";

/** 짧은 목록 두 개. 요약 모델 순서와 챗봇 첫 화면의 추천 질문. */
export default function SettingsTab() {
  return (
    <div className="space-y-4">
      <ModelPreferencesPanel />
      <SuggestedQuestionsCard />
    </div>
  );
}

import ModelPreferencesPanel from "./ModelPreferencesPanel";

/**
 * 모델 탭.
 *
 * 모델 후보의 성적은 공개 모델 현황에서 확인하고, 이 탭에서는 요약 폴백 순서만 관리한다.
 */
export default function LlmModelsTab() {
  return <ModelPreferencesPanel />;
}

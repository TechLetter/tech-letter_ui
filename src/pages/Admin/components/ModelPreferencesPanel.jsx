import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Badge from "../../../components/common/Badge";
import {
  getLlmModelPreferences,
  handleAdminError,
  setLlmModelPreference,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";

const PREFERENCES = [
  { value: "summary", label: "요약" },
  { value: "chat", label: "챗봇 답변" },
  { value: "planner", label: "챗봇 플래너" },
];

const SOURCE_LABELS = {
  database: "DB 설정",
  settings: "env 기본값",
};

const emptyPreference = (purpose) => ({
  purpose,
  models: [],
  source: "settings",
});

const normalizeModels = (models) =>
  (Array.isArray(models) ? models : [])
    .filter((model) => typeof model === "string")
    .map((model) => model.trim())
    .filter(Boolean);

const parseDraft = (draft) =>
  draft
    .split(/\r?\n/)
    .map((model) => model.trim())
    .filter(Boolean);

const createPreferenceMap = (items) => {
  const preferences = Object.fromEntries(
    PREFERENCES.map(({ value }) => [value, emptyPreference(value)])
  );

  (Array.isArray(items) ? items : []).forEach((item) => {
    if (!preferences[item?.purpose]) return;
    preferences[item.purpose] = {
      purpose: item.purpose,
      models: normalizeModels(item.models),
      source: item.source || "settings",
    };
  });

  return preferences;
};

const createDrafts = (preferences) =>
  Object.fromEntries(
    PREFERENCES.map(({ value }) => [value, preferences[value].models.join("\n")])
  );

function ModelPreferenceCard({
  preference,
  draft,
  observedModelIds,
  saving,
  onDraftChange,
  onAppendModel,
  onSave,
  onReset,
}) {
  const purpose = PREFERENCES.find((item) => item.value === preference.purpose);
  const sourceLabel = SOURCE_LABELS[preference.source] || preference.source;
  const sourceVariant = preference.source === "database" ? "info" : "neutral";

  return (
    <article
      className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      data-testid={`model-preference-${preference.purpose}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{purpose.label}</h3>
        <Badge variant={sourceVariant}>{sourceLabel}</Badge>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">현재 적용 순서</p>
        {preference.models.length > 0 ? (
          <ol className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {preference.models.map((model, index) => (
              <li key={`${model}-${index}`} className="flex min-w-0 gap-2">
                <span className="w-5 shrink-0 text-right text-slate-400">{index + 1}.</span>
                <span className="min-w-0 break-all">{model}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">지정된 모델이 없습니다.</p>
        )}
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          편집 목록 (한 줄에 모델 ID 하나)
        </span>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={saving}
          rows={6}
          aria-label={`${purpose.label} 모델 선호목록`}
          className="mt-2 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40 dark:disabled:bg-slate-700"
          placeholder="예: gemini-2.5-flash"
        />
      </label>

      <details className="mt-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
        <summary className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
          현재 관측된 모델 ({observedModelIds.length})
        </summary>
        {observedModelIds.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {observedModelIds.map((modelId) => (
              <button
                key={modelId}
                type="button"
                disabled={saving}
                onClick={() => onAppendModel(modelId)}
                className="max-w-full rounded-full border border-slate-200 bg-white px-2 py-1 text-left text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                title={`${modelId} 추가`}
              >
                <span className="break-all">{modelId}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            현재 탭에서 관측된 모델이 없습니다.
          </p>
        )}
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          기본값으로 되돌리기
        </button>
      </div>
    </article>
  );
}

ModelPreferenceCard.propTypes = {
  preference: PropTypes.shape({
    purpose: PropTypes.string.isRequired,
    models: PropTypes.arrayOf(PropTypes.string).isRequired,
    source: PropTypes.string.isRequired,
  }).isRequired,
  draft: PropTypes.string.isRequired,
  observedModelIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  saving: PropTypes.bool.isRequired,
  onDraftChange: PropTypes.func.isRequired,
  onAppendModel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

/**
 * 모델 선호목록 패널. 용도(summary/chat/planner)별로 라우터가 우선 시도할 모델 id 목록을 편집한다.
 * 백엔드 `GET/PUT /api/v1/admin/llm-models/preferences` 를 쓰며, DB 에 값이 있으면 서버 env 기본값은 무시된다(source 배지로 구분).
 * 빈 목록을 저장하면 DB 문서를 지워 env 기본값으로 되돌아간다.
 */
export default function ModelPreferencesPanel({ observedModels = [] }) {
  const initialPreferences = createPreferenceMap();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [drafts, setDrafts] = useState(createDrafts(initialPreferences));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [savingPurpose, setSavingPurpose] = useState(null);

  const observedModelIds = useMemo(
    () =>
      Array.from(
        new Set(
          observedModels
            .map((model) => model?.model_id)
            .filter((modelId) => typeof modelId === "string" && modelId.trim())
            .map((modelId) => modelId.trim())
        )
      ),
    [observedModels]
  );

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setLoadError("");
    getLlmModelPreferences()
      .then((response = {}) => {
        if (ignore) return;
        const nextPreferences = createPreferenceMap(response.items);
        setPreferences(nextPreferences);
        setDrafts(createDrafts(nextPreferences));
      })
      .catch((error) => {
        if (ignore) return;
        setLoadError(handleAdminError(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [retryKey]);

  const updateDraft = (purpose, value) => {
    setDrafts((current) => ({ ...current, [purpose]: value }));
  };

  const appendObservedModel = (purpose, modelId) => {
    setDrafts((current) => {
      const existing = parseDraft(current[purpose] || "");
      return { ...current, [purpose]: [...existing, modelId].join("\n") };
    });
  };

  const savePreference = async (purpose, reset = false) => {
    const preference = PREFERENCES.find((item) => item.value === purpose);
    if (!preference) return;

    if (reset && !window.confirm(`${preference.label} 선호목록을 env 기본값으로 되돌릴까요?`)) {
      return;
    }

    const models = reset ? [] : parseDraft(drafts[purpose] || "");
    if (models.length > 50) {
      showToast("모델 선호목록은 최대 50개까지 저장할 수 있습니다.", "error");
      return;
    }

    setSavingPurpose(purpose);
    try {
      const result = await setLlmModelPreference(purpose, models);
      const nextPreference = {
        purpose,
        models: normalizeModels(result?.models ?? models),
        source: result?.source || (reset ? "settings" : "database"),
      };
      setPreferences((current) => ({ ...current, [purpose]: nextPreference }));
      setDrafts((current) => ({
        ...current,
        [purpose]: nextPreference.models.join("\n"),
      }));
      showToast(
        reset
          ? `${preference.label} 선호목록을 기본값으로 되돌렸습니다.`
          : `${preference.label} 선호목록을 저장했습니다.`,
        "success"
      );
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSavingPurpose(null);
    }
  };

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
      data-testid="model-preferences-panel"
      aria-busy={loading}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">모델 선호목록</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          선호목록은 실시간 헬스체크를 통과한 모델과 교집합으로 쓰이며, 비어 있으면 헬스 목록 상위
          모델을 자동 사용한다. DB 값이 있으면 서버 env 는 무시된다.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
          선호목록을 불러오는 중입니다.
        </div>
      ) : loadError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="rounded-lg border border-red-200 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PREFERENCES.map((preference) => (
            <ModelPreferenceCard
              key={preference.value}
              preference={preferences[preference.value]}
              draft={drafts[preference.value]}
              observedModelIds={observedModelIds}
              saving={savingPurpose === preference.value}
              onDraftChange={(value) => updateDraft(preference.value, value)}
              onAppendModel={(modelId) => appendObservedModel(preference.value, modelId)}
              onSave={() => savePreference(preference.value)}
              onReset={() => savePreference(preference.value, true)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

ModelPreferencesPanel.propTypes = {
  observedModels: PropTypes.arrayOf(
    PropTypes.shape({
      model_id: PropTypes.string,
    })
  ),
};

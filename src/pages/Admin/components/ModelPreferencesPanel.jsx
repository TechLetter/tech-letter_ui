import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { RiAddLine } from "react-icons/ri";
import {
  getLlmModelPreferences,
  handleAdminError,
  setLlmModelPreference,
} from "../../../api/adminApi";
import llmModelsApi from "../../../api/llmModelsApi";
import { showToast } from "../../../provider/toastModalBridge";
import ModelDropdown from "../../../components/common/ModelDropdown";
import ModelStatusDot from "../../../components/common/ModelStatusDot";
import {
  HEALTH_DOT_CLASS,
  HEALTH_LEVEL,
  classifyModelHealth,
  formatModelMeta,
  sortModelsByHealth,
} from "../../../utils/modelHealth";

const SUMMARY_PURPOSE = "summary";
const SUMMARY_LABEL = "요약";
const MAX_CUSTOM_MODELS = 50;
const UNAVAILABLE_TOOLTIP = "현재 응답 없음 — 건너뜁니다";

const normalizeModels = (models) =>
  (Array.isArray(models) ? models : [])
    .filter((model) => typeof model === "string")
    .map((model) => model.trim())
    .filter(Boolean);

const normalizeHealthModels = (items) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => typeof item?.model_id === "string")
    .map((item) => ({ ...item, model_id: item.model_id.trim() }))
    .filter((item) => item.model_id);

const parseSummaryPreference = (item, fallbackDefaultModels = []) => {
  const models = normalizeModels(item?.models);
  const defaultModels = Array.isArray(item?.default_models)
    ? normalizeModels(item.default_models)
    : fallbackDefaultModels;

  return {
    models: models.length > 0 || defaultModels.length === 0 ? models : defaultModels,
    defaultModels,
  };
};

const getCustomModels = (models, defaultModels) =>
  models.slice(Math.min(defaultModels.length, models.length));

const areSameModels = (left, right) =>
  left.length === right.length && left.every((model, index) => model === right[index]);

// 헬스 기록이 아예 없거나(unknown) 정상(healthy)이면 점을 안 찍는다.
// 눈에 띄어야 할 건 degraded/down뿐이다.
const warningLevel = (health) => {
  const level = classifyModelHealth(health);
  return level === HEALTH_LEVEL.HEALTHY || level === HEALTH_LEVEL.UNKNOWN ? null : level;
};

// 칩을 가로로 늘어놓으면 "순서 없는 태그 묶음"처럼 보인다. 여기는 "위에서부터
// 순서대로 시도한다"는 게 핵심이라, 번호를 붙인 세로 목록으로 그 순서를 눈에
// 보이게 한다. 화살표도 ↑↓ 로 — 세로 목록에서 좌우보다 위아래가 더 직관적이다.
function ModelRow({
  order,
  modelId,
  isDefault,
  warningLevel: level,
  isFirstCustom,
  isLastCustom,
  disabled,
  onMove,
  onRemove,
}) {
  return (
    <li>
      <div
        className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
          isDefault
            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300"
            : "border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        }`}
      >
        <span className="w-4 shrink-0 text-right text-xs font-medium text-slate-400 dark:text-slate-500">
          {order}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {isDefault ? `기본: ${modelId} 🔒` : modelId}
        </span>
        {level && (
          <span
            aria-label={UNAVAILABLE_TOOLTIP}
            className={`h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT_CLASS[level]}`}
            role="img"
            title={UNAVAILABLE_TOOLTIP}
          />
        )}
        {!isDefault && (
          <span className="ml-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label={`${modelId} 위로 이동`}
              className="rounded-full px-1.5 py-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              disabled={disabled || isFirstCustom}
              onClick={() => onMove(-1)}
              title="위로 이동"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`${modelId} 아래로 이동`}
              className="rounded-full px-1.5 py-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              disabled={disabled || isLastCustom}
              onClick={() => onMove(1)}
              title="아래로 이동"
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`${modelId} 삭제`}
              className="rounded-full px-1.5 py-0.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              disabled={disabled}
              onClick={onRemove}
              title="삭제"
            >
              ✕
            </button>
          </span>
        )}
      </div>
    </li>
  );
}

ModelRow.propTypes = {
  order: PropTypes.number.isRequired,
  modelId: PropTypes.string.isRequired,
  isDefault: PropTypes.bool.isRequired,
  warningLevel: PropTypes.oneOf(["degraded", "down"]),
  isFirstCustom: PropTypes.bool.isRequired,
  isLastCustom: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onMove: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

/** 요약 폴백 순서만 편집하며, 기본값은 서버가 앞에 붙인 순서 그대로 잠근다. */
export default function ModelPreferencesPanel() {
  const [models, setModels] = useState([]);
  const [defaultModels, setDefaultModels] = useState([]);
  const [savedCustomModels, setSavedCustomModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [healthModels, setHealthModels] = useState([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState("");
  const [healthRetryKey, setHealthRetryKey] = useState(0);
  const [directModelId, setDirectModelId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setLoadError("");
    getLlmModelPreferences()
      .then((response = {}) => {
        if (ignore) return;
        const summaryItem = Array.isArray(response.items)
          ? response.items.find((item) => item?.purpose === SUMMARY_PURPOSE)
          : undefined;
        const preference = parseSummaryPreference(summaryItem);
        setModels(preference.models);
        setDefaultModels(preference.defaultModels);
        setSavedCustomModels(getCustomModels(preference.models, preference.defaultModels));
      })
      .catch((error) => {
        if (!ignore) setLoadError(handleAdminError(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [retryKey]);

  useEffect(() => {
    let ignore = false;

    setHealthLoading(true);
    setHealthError("");
    llmModelsApi
      .getModels()
      .then((response = {}) => {
        if (ignore) return;
        setHealthModels(normalizeHealthModels(response?.data?.items ?? response?.items));
      })
      .catch((error) => {
        if (!ignore) setHealthError(handleAdminError(error));
      })
      .finally(() => {
        if (!ignore) setHealthLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [healthRetryKey]);

  const customModels = useMemo(
    () => getCustomModels(models, defaultModels),
    [defaultModels, models]
  );
  const defaultCount = Math.min(defaultModels.length, models.length);
  const isDirty = !areSameModels(customModels, savedCustomModels);

  const healthByModelId = useMemo(() => {
    const healthMap = new Map();
    healthModels.forEach((health) => healthMap.set(health.model_id, health));
    return healthMap;
  }, [healthModels]);

  const candidateModels = useMemo(() => {
    const selectedModels = new Set(models);
    return healthModels.filter((health) => !selectedModels.has(health.model_id));
  }, [healthModels, models]);

  // "모두 실패하면 자동" 이 지금 이 순간 실제로 어떤 모델을 가리키는지.
  // 되돌리기 버튼을 누르지 않고도, 목록을 짜기 전에도 늘 보여야 한다.
  const autoPick = useMemo(() => sortModelsByHealth(healthModels)[0] ?? null, [healthModels]);

  const addModel = (rawModelId) => {
    const modelId = typeof rawModelId === "string" ? rawModelId.trim() : "";
    if (!modelId) return false;
    if (models.includes(modelId)) {
      showToast("이미 추가된 모델입니다.", "error");
      return false;
    }
    if (customModels.length >= MAX_CUSTOM_MODELS) {
      showToast("모델은 최대 50개까지 추가할 수 있습니다.", "error");
      return false;
    }

    setModels((current) => [...current, modelId]);
    return true;
  };

  const handleAddDirectModel = (event) => {
    event.preventDefault();
    if (addModel(directModelId)) setDirectModelId("");
  };

  const moveModel = (index, direction) => {
    setModels((current) => {
      const firstCustomIndex = Math.min(defaultModels.length, current.length);
      const targetIndex = index + direction;
      if (
        index < firstCustomIndex ||
        targetIndex < firstCustomIndex ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const nextModels = [...current];
      [nextModels[index], nextModels[targetIndex]] = [
        nextModels[targetIndex],
        nextModels[index],
      ];
      return nextModels;
    });
  };

  const removeModel = (index) => {
    if (index < defaultCount) return;
    setModels((current) => current.filter((_, modelIndex) => modelIndex !== index));
  };

  const applyPreference = (item) => {
    const preference = parseSummaryPreference(item, defaultModels);
    setModels(preference.models);
    setDefaultModels(preference.defaultModels);
    setSavedCustomModels(getCustomModels(preference.models, preference.defaultModels));
  };

  const savePreference = async (reset = false) => {
    if (reset && !window.confirm("요약에 쓸 모델을 기본값으로 되돌릴까요?")) return;

    setSaving(true);
    try {
      const result = await setLlmModelPreference(
        SUMMARY_PURPOSE,
        reset ? [] : customModels
      );
      applyPreference(result?.data ?? result);
      showToast(
        reset ? "요약 모델을 기본값으로 되돌렸습니다." : "요약 모델을 저장했습니다.",
        "success"
      );
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
      data-testid="model-preferences-panel"
      aria-busy={loading || saving}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {SUMMARY_LABEL}에 쓸 모델
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          위에서부터 순서대로 시도합니다. 모두 실패하면 그때그때 가장 안정적인 모델을 자동으로 씁니다.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
          설정을 불러오는 중입니다.
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
        <>
          <div data-testid="model-chain" aria-label="모델 시도 순서">
            <ol className="flex min-w-0 flex-col gap-1.5">
              {models.map((modelId, index) => (
                <ModelRow
                  key={`${modelId}-${index}`}
                  order={index + 1}
                  modelId={modelId}
                  isDefault={index < defaultCount}
                  warningLevel={warningLevel(healthByModelId.get(modelId))}
                  isFirstCustom={index === defaultCount}
                  isLastCustom={index === models.length - 1}
                  disabled={saving}
                  onMove={(direction) => moveModel(index, direction)}
                  onRemove={() => removeModel(index)}
                />
              ))}
              <li>
                <ModelDropdown
                  options={candidateModels}
                  onSelect={addModel}
                  loading={healthLoading}
                  disabled={saving}
                  emptyMessage="추가할 모델이 없습니다."
                  trigger={({ open, toggle }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      disabled={saving || healthLoading || candidateModels.length === 0}
                      aria-expanded={open}
                      data-testid="model-add-button"
                      className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-indigo-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                    >
                      <span className="w-4 shrink-0 text-right text-xs font-medium text-slate-400 dark:text-slate-500">
                        {models.length + 1}
                      </span>
                      <RiAddLine className="shrink-0" />
                      {healthLoading ? "모델 목록을 불러오는 중..." : "모델 추가"}
                    </button>
                  )}
                />
              </li>
            </ol>

            {autoPick && (
              <p className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 pl-6 text-xs text-slate-500 dark:text-slate-400">
                <span>↓ 여기까지 모두 실패하면 자동 전환 — 지금은</span>
                <ModelStatusDot level={classifyModelHealth(autoPick)} />
                <span className="min-w-0 truncate font-mono">{autoPick.model_id}</span>
                {formatModelMeta(autoPick) && <span>({formatModelMeta(autoPick)})</span>}
              </p>
            )}
          </div>

          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={handleAddDirectModel}
          >
            <label className="min-w-[min(100%,18rem)] flex-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                목록에 없는 모델 직접 입력
              </span>
              <input
                type="text"
                value={directModelId}
                onChange={(event) => setDirectModelId(event.target.value)}
                disabled={saving}
                aria-label="목록에 없는 모델 직접 입력"
                data-testid="model-direct-input"
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40 dark:disabled:bg-slate-700"
                placeholder="예: 공급자/모델명:free"
              />
            </label>
            <button
              type="submit"
              disabled={saving || !directModelId.trim()}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              직접 추가
            </button>
          </form>

          {healthError && (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300"
              role="alert"
            >
              <span>{healthError}</span>
              <button
                type="button"
                onClick={() => setHealthRetryKey((current) => current + 1)}
                className="font-medium underline underline-offset-2"
              >
                목록 다시 시도
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => savePreference()}
              disabled={saving || !isDirty}
              data-testid="model-save-button"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => savePreference(true)}
              disabled={saving}
              data-testid="model-reset-button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              기본값으로 되돌리기
            </button>
          </div>
        </>
      )}
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCloseLine,
  RiLockLine,
} from "react-icons/ri";
import {
  getLlmModelPreferences,
  handleAdminError,
  setLlmModelPreference,
} from "../../../api/adminApi";
import llmModelsApi from "../../../api/llmModelsApi";
import { showToast } from "../../../provider/toastModalBridge";
import ModelDropdown from "../../../components/common/ModelDropdown";
import ModelStatusDot from "../../../components/common/ModelStatusDot";
import { classifyModelHealth, formatModelMeta, sortModelsByHealth } from "../../../utils/modelHealth";
import { displayName } from "../../../utils/modelName";
import { IconAction } from "./AdminKit";

const SUMMARY_PURPOSE = "summary";
const MAX_CUSTOM_MODELS = 50;

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

// 칩을 가로로 늘어놓으면 "순서 없는 태그 묶음"처럼 보인다. 여기는 "위에서부터
// 순서대로 시도한다"는 게 핵심이라, 번호를 붙인 세로 목록으로 그 순서를 눈에
// 보이게 한다. 화살표도 ↑↓ 로 — 세로 목록에서 좌우보다 위아래가 더 직관적이다.
function ModelName({ health, modelId }) {
  const { provider, name } = displayName(health || { model_id: modelId });
  return (
    <span className="min-w-0 flex-1 truncate" title={modelId}>
      {provider && <span className="text-slate-400 dark:text-slate-500">{provider} · </span>}
      <span className="text-slate-800 dark:text-slate-100">{name}</span>
    </span>
  );
}

function ModelMeta({ health }) {
  const meta = health && formatModelMeta(health);
  return meta ? (
    <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">{meta}</span>
  ) : null;
}

function ModelRow({ order, modelId, health, isDefault, isFirstCustom, isLastCustom, disabled, onMove, onRemove }) {
  return (
    <li className="flex min-w-0 items-center gap-2.5 py-1.5 text-sm">
      <span className="w-7 shrink-0 text-right text-xs tabular-nums text-slate-400">{order}</span>
      <ModelStatusDot level={classifyModelHealth(health)} />
      <ModelName health={health} modelId={modelId} />
      <ModelMeta health={health} />
      {isDefault ? (
        <RiLockLine aria-label="기본 모델" title="기본 모델" className="mx-2 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
      ) : (
        <span className="flex shrink-0 items-center">
          <IconAction onClick={() => onMove(-1)} disabled={disabled || isFirstCustom} label="위로">
            <RiArrowUpSLine className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={() => onMove(1)} disabled={disabled || isLastCustom} label="아래로">
            <RiArrowDownSLine className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={onRemove} disabled={disabled} label="빼기" tone="rose">
            <RiCloseLine className="h-4 w-4" />
          </IconAction>
        </span>
      )}
    </li>
  );
}

ModelRow.propTypes = {
  order: PropTypes.number.isRequired,
  modelId: PropTypes.string.isRequired,
  health: PropTypes.object,
  isDefault: PropTypes.bool.isRequired,
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
  const [directOpen, setDirectOpen] = useState(false);
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
    if (addModel(directModelId)) {
      setDirectModelId("");
      setDirectOpen(false);
    }
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

  const buttons = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => savePreference(true)}
        disabled={saving || loading}
        data-testid="model-reset-button"
        className="h-8 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        기본값으로
      </button>
      <button
        type="button"
        onClick={() => savePreference()}
        disabled={saving || !isDirty}
        data-testid="model-save-button"
        className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {saving ? "저장 중" : "저장"}
      </button>
    </div>
  );

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      data-testid="model-preferences-panel"
      aria-busy={loading || saving}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">요약 모델</h2>
        {buttons}
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      ) : loadError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300"
          role="alert"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="rounded-lg border border-rose-200 px-3 py-1.5 font-medium hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/40"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <ol data-testid="model-chain" aria-label="모델 시도 순서" className="flex min-w-0 flex-col">
          {models.map((modelId, index) => (
            <ModelRow
              key={`${modelId}-${index}`}
              order={index + 1}
              modelId={modelId}
              health={healthByModelId.get(modelId)}
              isDefault={index < defaultCount}
              isFirstCustom={index === defaultCount}
              isLastCustom={index === models.length - 1}
              disabled={saving}
              onMove={(direction) => moveModel(index, direction)}
              onRemove={() => removeModel(index)}
            />
          ))}

          <li className="flex items-center gap-2 py-1.5">
            <span className="w-7 shrink-0" />
            <ModelDropdown
              options={candidateModels}
              onSelect={addModel}
              loading={healthLoading}
              disabled={saving}
              emptyMessage="추가할 모델 없음"
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={saving || healthLoading || candidateModels.length === 0}
                  aria-expanded={open}
                  data-testid="model-add-button"
                  className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                >
                  <RiAddLine className="h-4 w-4" />
                  모델 추가
                </button>
              )}
            />
            {!directOpen && (
              <button
                type="button"
                onClick={() => setDirectOpen(true)}
                className="h-8 rounded-lg px-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                id로 추가
              </button>
            )}
          </li>

          {directOpen && (
            <li className="py-1.5 pl-9">
              <form className="flex items-center gap-2" onSubmit={handleAddDirectModel}>
                <input
                  type="text"
                  autoFocus
                  value={directModelId}
                  onChange={(event) => setDirectModelId(event.target.value)}
                  onKeyDown={(event) => event.key === "Escape" && setDirectOpen(false)}
                  disabled={saving}
                  aria-label="모델 id"
                  data-testid="model-direct-input"
                  placeholder="provider/model:free"
                  className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={saving || !directModelId.trim()}
                  className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  추가
                </button>
              </form>
            </li>
          )}

          {/* 목록이 모두 실패하면 그때 가장 안정적인 모델로 넘어간다. 지금 그게 무엇인지. */}
          {autoPick && (
            <li
              className="mt-1 flex min-w-0 items-center gap-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-0 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800/40"
              title="목록이 모두 실패하면 지금 가장 안정적인 모델로 넘어갑니다"
            >
              <span className="w-7 shrink-0 text-right text-xs text-slate-400">자동</span>
              <ModelStatusDot level={classifyModelHealth(autoPick)} />
              <ModelName health={autoPick} modelId={autoPick.model_id} />
              <span className="pr-3">
                <ModelMeta health={autoPick} />
              </span>
            </li>
          )}

          {healthError && (
            <li
              className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300"
              role="alert"
            >
              <span>{healthError}</span>
              <button
                type="button"
                onClick={() => setHealthRetryKey((current) => current + 1)}
                className="font-medium underline underline-offset-2"
              >
                다시 시도
              </button>
            </li>
          )}
        </ol>
      )}
    </section>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import {
  createSuggestedQuestion,
  deleteSuggestedQuestion,
  getSuggestedQuestions,
  handleAdminError,
  updateSuggestedQuestion,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { IconAction } from "./AdminKit";

const byOrder = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);
const payloadOf = (q, patch = {}) => ({
  text: q.text,
  sort_order: q.sort_order || 0,
  is_active: Boolean(q.is_active),
  ...patch,
});

/** 챗봇 첫 화면의 추천 질문. 순서는 ↑↓, 숨기기는 눈 아이콘, 글은 눌러서 바로 고친다. */
export default function SuggestedQuestionsCard() {
  const [questions, setQuestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null); // { id | "new", text }

  const load = useCallback(async () => {
    try {
      const { items = [] } = await getSuggestedQuestions();
      setQuestions([...items].sort(byOrder));
    } catch (error) {
      showToast(handleAdminError(error), "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (work) => {
    setBusy(true);
    try {
      await work();
      await load();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const move = (index, delta) => {
    const a = questions[index];
    const b = questions[index + delta];
    if (!a || !b) return;
    run(async () => {
      await updateSuggestedQuestion(a.id, payloadOf(a, { sort_order: b.sort_order }));
      await updateSuggestedQuestion(b.id, payloadOf(b, { sort_order: a.sort_order }));
    });
  };

  const save = () => {
    const text = editing?.text.trim();
    if (!text) {
      setEditing(null);
      return;
    }
    run(async () => {
      if (editing.id === "new") {
        const last = questions.at(-1)?.sort_order || 0;
        await createSuggestedQuestion({ text, sort_order: last + 10, is_active: true });
      } else {
        const q = questions.find((item) => item.id === editing.id);
        await updateSuggestedQuestion(q.id, payloadOf(q, { text }));
      }
      setEditing(null);
    });
  };

  const remove = (q) => {
    if (!window.confirm("추천 질문을 삭제할까요?")) return;
    run(() => deleteSuggestedQuestion(q.id));
  };

  const editor = (
    <input
      autoFocus
      aria-label="추천 질문"
      value={editing?.text || ""}
      onChange={(e) => setEditing((prev) => ({ ...prev, text: e.target.value }))}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(null);
      }}
      onBlur={save}
      disabled={busy}
      className="h-9 w-full rounded-lg border border-indigo-300 bg-white px-2.5 text-sm text-slate-900 outline-none dark:border-indigo-500/60 dark:bg-slate-900 dark:text-slate-100"
    />
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          추천 질문
          <span className="ml-2 font-medium tabular-nums text-slate-400 dark:text-slate-500">{questions.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setEditing({ id: "new", text: "" })}
          disabled={busy || editing?.id === "new"}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
          <RiAddLine className="h-4 w-4" />
          추가
        </button>
      </div>

      <ol className="divide-y divide-slate-100 dark:divide-slate-800">
        {questions.map((q, index) => (
          <li key={q.id} className={`flex items-center gap-3 py-2 ${q.is_active ? "" : "opacity-50"}`}>
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{index + 1}</span>
            <div className="min-w-0 flex-1">
              {editing?.id === q.id ? (
                editor
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing({ id: q.id, text: q.text })}
                  title="눌러서 고치기"
                  className="block w-full truncate text-left text-sm text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                >
                  {q.text}
                </button>
              )}
            </div>
            <div className="flex shrink-0 items-center">
              <IconAction onClick={() => move(index, -1)} disabled={busy || index === 0} label="위로">
                <RiArrowUpSLine className="h-4 w-4" />
              </IconAction>
              <IconAction
                onClick={() => move(index, 1)}
                disabled={busy || index === questions.length - 1}
                label="아래로"
              >
                <RiArrowDownSLine className="h-4 w-4" />
              </IconAction>
              <IconAction
                onClick={() => run(() => updateSuggestedQuestion(q.id, payloadOf(q, { is_active: !q.is_active })))}
                disabled={busy}
                label={q.is_active ? "숨기기" : "보이기"}
              >
                {q.is_active ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
              </IconAction>
              <IconAction onClick={() => remove(q)} disabled={busy} label="삭제" tone="rose">
                <RiDeleteBinLine className="h-4 w-4" />
              </IconAction>
            </div>
          </li>
        ))}
        {editing?.id === "new" && (
          <li className="flex items-center gap-3 py-2">
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{questions.length + 1}</span>
            <div className="min-w-0 flex-1">{editor}</div>
          </li>
        )}
      </ol>
    </section>
  );
}

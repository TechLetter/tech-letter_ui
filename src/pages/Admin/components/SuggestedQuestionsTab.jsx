import { useCallback, useEffect, useState } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiRefreshLine,
  RiSaveLine,
  RiCloseLine,
} from "react-icons/ri";
import Badge from "../../../components/common/Badge";
import Table from "../../../components/common/Table";
import {
  createChatbotSuggestedQuestion,
  deleteChatbotSuggestedQuestion,
  getChatbotSuggestedQuestions,
  handleAdminError,
  updateChatbotSuggestedQuestion,
} from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";
import { formatKSTDateTime } from "../../../utils/timeutils";

const createEmptyDraft = (sortOrder = 10) => ({
  text: "",
  sort_order: sortOrder,
  is_active: true,
});

export default function SuggestedQuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(createEmptyDraft());

  const nextSortOrder =
    questions.length > 0
      ? Math.max(...questions.map((question) => question.sort_order || 0)) + 10
      : 10;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatbotSuggestedQuestions();
      setQuestions(data || []);
      if (!editingId) {
        setDraft(createEmptyDraft(
          data?.length
            ? Math.max(...data.map((question) => question.sort_order || 0)) + 10
            : 10
        ));
      }
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [editingId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const resetDraft = () => {
    setEditingId(null);
    setDraft(createEmptyDraft(nextSortOrder));
  };

  const startEdit = (question) => {
    setEditingId(question.id);
    setDraft({
      text: question.text,
      sort_order: question.sort_order || 0,
      is_active: Boolean(question.is_active),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.text.trim();
    if (!text) {
      showToast("추천 질문을 입력해주세요.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        text,
        sort_order: Number(draft.sort_order) || 0,
        is_active: Boolean(draft.is_active),
      };
      if (editingId) {
        await updateChatbotSuggestedQuestion(editingId, payload);
        showToast("추천 질문이 수정되었습니다.", "success");
      } else {
        await createChatbotSuggestedQuestion(payload);
        showToast("추천 질문이 추가되었습니다.", "success");
      }
      resetDraft();
      fetchQuestions();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (question) => {
    if (!window.confirm("추천 질문을 삭제할까요?")) {
      return;
    }
    setSubmitting(true);
    try {
      await deleteChatbotSuggestedQuestion(question.id);
      showToast("추천 질문이 삭제되었습니다.", "success");
      if (editingId === question.id) {
        resetDraft();
      }
      fetchQuestions();
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "sort_order",
      label: "순서",
      width: "80px",
      align: "right",
      render: (sortOrder) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {sortOrder}
        </span>
      ),
    },
    {
      key: "text",
      label: "추천 질문",
      render: (text) => (
        <span className="block whitespace-normal break-words text-slate-900 dark:text-slate-100">
          {text}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "상태",
      width: "90px",
      align: "center",
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "warning"}>
          {isActive ? "활성" : "숨김"}
        </Badge>
      ),
    },
    {
      key: "updated_at",
      label: "수정일",
      width: "160px",
      render: (updatedAt) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatKSTDateTime(updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "작업",
      width: "120px",
      align: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => startEdit(row)}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            title="수정"
          >
            <RiEditLine />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="삭제"
          >
            <RiDeleteBinLine />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            추천 질문 관리
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            총 {questions.length.toLocaleString()}개
          </p>
        </div>
        <button
          type="button"
          onClick={fetchQuestions}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RiRefreshLine className={loading ? "animate-spin" : ""} />
          새로고침
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_120px_120px_auto] lg:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              추천 질문
            </span>
            <textarea
              value={draft.text}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, text: event.target.value }))
              }
              rows={2}
              maxLength={500}
              placeholder="챗봇 첫 화면에 보여줄 질문을 입력하세요."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              순서
            </span>
            <input
              type="number"
              min="0"
              value={draft.sort_order}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  sort_order: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  is_active: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            활성
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetDraft}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RiCloseLine />
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {editingId ? <RiSaveLine /> : <RiAddLine />}
              {editingId ? "저장" : "추가"}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Table
          columns={columns}
          data={questions}
          loading={loading}
          emptyMessage="등록된 추천 질문이 없습니다."
        />
      </div>
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RiSparklingLine } from "react-icons/ri";
import { displayName } from "../../../utils/modelName";
import SecurityNotice from "./SecurityNotice";
import SourceList from "./SourceList";

/**
 * MessageBubble 컴포넌트
 * 사용자는 오른쪽 말풍선, 답변은 스파크 아이콘 + 본문 + 참고한 글 + 모델.
 */
export default function MessageBubble({ message, models = [] }) {
  const isUser = message.role === "user";
  const requestedModelId =
    typeof message.requestedModelId === "string" ? message.requestedModelId : "";
  const actualModelId =
    typeof message.agent?.model_id === "string" ? message.agent.model_id : "";
  const usedModelFallback =
    !isUser && requestedModelId && actualModelId && requestedModelId !== actualModelId;
  const modelLabel = actualModelId
    ? displayName(models.find((m) => m.model_id === actualModelId) || { model_id: actualModelId }).name
    : "";

  if (isUser) {
    return (
      <div className="mb-5 flex w-full justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-accent-soft px-4 py-2.5 text-[15px] leading-relaxed text-accent-ink sm:max-w-[78%]">
          <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex w-full min-w-0 gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
        <RiSparklingLine className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <SecurityNotice guard={message.guard} />
        {usedModelFallback && (
          <p className="mb-2 text-xs text-ink-3" role="status">
            고른 모델이 응답하지 않아{" "}
            <span className="break-all font-medium" title={actualModelId}>
              {modelLabel}
            </span>
            로 답했습니다.
          </p>
        )}
        <div className="prose prose-sm prose-slate max-w-none text-[15px] leading-relaxed text-ink dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent-ink hover:underline" />
              ),
              h1: ({ ...props }) => <h1 {...props} className="mt-6 mb-4 text-xl font-bold" />,
              h2: ({ ...props }) => <h2 {...props} className="mt-5 mb-3 text-lg font-bold" />,
              h3: ({ ...props }) => <h3 {...props} className="mt-4 mb-2 text-base font-bold" />,
              ul: ({ ...props }) => <ul {...props} className="my-2 list-disc pl-5" />,
              ol: ({ ...props }) => <ol {...props} className="my-2 list-decimal pl-5" />,
              p: ({ ...props }) => <p {...props} className="my-2 break-words [overflow-wrap:anywhere]" />,
              code: ({ className, children, ...props }) => (
                <code className={`${className || ""} rounded bg-canvas px-1 py-0.5 break-words`} {...props}>
                  {children}
                </code>
              ),
              pre: ({ ...props }) => (
                <pre {...props} className="my-4 max-w-full overflow-x-auto rounded-lg bg-canvas p-3 text-sm" />
              ),
              table: ({ ...props }) => (
                <div className="my-4 max-w-full overflow-x-auto">
                  <table {...props} className="w-full min-w-max text-sm" />
                </div>
              ),
              th: ({ ...props }) => <th {...props} className="border border-line px-2 py-1 text-left" />,
              td: ({ ...props }) => <td {...props} className="border border-line px-2 py-1" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <SourceList sources={message.sources} />
        {modelLabel && !message.isStreaming && (
          <p className="mt-2 text-[11px] text-ink-3">{modelLabel}</p>
        )}
      </div>
    </div>
  );
}

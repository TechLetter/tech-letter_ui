import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AgentActivityPanel from "./AgentActivityPanel";
import SecurityNotice from "./SecurityNotice";
import SourceList from "./SourceList";

/**
 * MessageBubble 컴포넌트
 * ChatGPT 스타일: 아이콘 제거, 봇 메시지는 텍스트만 표시, 유저는 회색 말풍선.
 *
 * @param {Object} props
 * @param {Object} props.message
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`mb-5 flex w-full min-w-0 ${
        isUser ? "justify-end" : "justify-start"
      } sm:mb-6`}
    >
      <div
        className={`flex w-full min-w-0 max-w-full ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`min-w-0 overflow-hidden text-[15px] leading-relaxed sm:text-base ${
            isUser
              ? "max-w-[88%] rounded-[1.5rem] rounded-tr-sm bg-indigo-600 px-4 py-3 text-white sm:max-w-[78%] sm:rounded-[2rem] sm:px-5"
              : "max-w-full bg-transparent text-slate-900 prose prose-sm prose-slate max-w-none dark:prose-invert dark:text-slate-100 sm:prose-base"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {message.content}
            </span>
          ) : (
            <>
              <SecurityNotice guard={message.guard} />
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    />
                  ),
                  // 모바일에서 너무 큰 제목 방지
                  h1: ({ ...props }) => (
                    <h1 {...props} className="mt-6 mb-4 text-xl font-bold sm:text-2xl" />
                  ),
                  h2: ({ ...props }) => (
                    <h2 {...props} className="mt-5 mb-3 text-lg font-bold sm:text-xl" />
                  ),
                  h3: ({ ...props }) => (
                    <h3 {...props} className="mt-4 mb-2 text-base font-bold sm:text-lg" />
                  ),
                  ul: ({ ...props }) => (
                    <ul {...props} className="list-disc pl-5 my-2" />
                  ),
                  ol: ({ ...props }) => (
                    <ol {...props} className="list-decimal pl-5 my-2" />
                  ),
                  p: ({ ...props }) => (
                    <p {...props} className="my-2 break-words [overflow-wrap:anywhere]" />
                  ),
                  code: ({ className, children, ...props }) => {
                    return (
                      <code
                        className={`${className} rounded bg-slate-100 px-1 py-0.5 break-words dark:bg-slate-800`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ ...props }) => (
                    <pre
                      {...props}
                      className="my-4 max-w-full overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800 sm:p-4"
                    />
                  ),
                  table: ({ ...props }) => (
                    <div className="my-4 max-w-full overflow-x-auto">
                      <table {...props} className="w-full min-w-max text-sm" />
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th
                      {...props}
                      className="border border-slate-200 px-2 py-1 text-left dark:border-slate-700"
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      {...props}
                      className="border border-slate-200 px-2 py-1 dark:border-slate-700"
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              <AgentActivityPanel agent={message.agent} memory={message.memory} />
              <SourceList sources={message.sources} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`flex w-full max-w-full ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`text-base leading-relaxed overflow-hidden max-w-full lg:max-w-4xl ${
            isUser
              ? "bg-indigo-600 text-white rounded-[2rem] rounded-tr-sm px-5 py-3" // 유저: 보라색 물방울(상단 꼬리)
              : "bg-transparent text-slate-900 dark:text-slate-100 prose prose-slate dark:prose-invert max-w-none" // 어시스턴트: 배경 없음, 순수 텍스트 (dark:prose-invert adds dark mode support for typography)
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  />
                ),
                // 모바일에서 너무 큰 제목 방지
                h1: ({ node, ...props }) => (
                  <h1 {...props} className="text-2xl font-bold mt-6 mb-4" />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-xl font-bold mt-5 mb-3" />
                ),
                h3: ({ node, ...props }) => (
                  <h3 {...props} className="text-lg font-bold mt-4 mb-2" />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc pl-5 my-2" />
                ),
                ol: ({ node, ...props }) => (
                  <ol {...props} className="list-decimal pl-5 my-2" />
                ),
                p: ({ node, ...props }) => <p {...props} className="my-2" />,
                code: ({ node, inline, className, children, ...props }) => {
                  return (
                    <code
                      className={`${className} bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ node, ...props }) => (
                  <pre
                    {...props}
                    className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto my-4"
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiChat3Line,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import chatbotApi from "../../../api/chatbotApi";
import CreditsBadge from "../../../components/chatbot/CreditsBadge";

/**
 * SessionSidebar - 세션 목록 사이드바
 * 데스크톱: 토글 가능한 좌측 사이드바
 * 모바일: 햄버거 버튼 + 슬라이드 오버레이
 */
export default function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSessionsLoaded,
  credits,
  isOpen,
  onToggle,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 세션 목록 로드
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const data = await chatbotApi.getSessionList();
        onSessionsLoaded(data.items || []);
      } catch (error) {
        console.error("세션 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [onSessionsLoaded]);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (deletingId) return;

    setDeletingId(sessionId);
    try {
      await chatbotApi.deleteSession(sessionId);
      onDeleteSession(sessionId);
    } catch (error) {
      console.error("세션 삭제 실패:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    setIsMobileOpen(false);
  };

  const handleNewChat = () => {
    onNewChat();
    setIsMobileOpen(false);
  };

  // 사이드바 컨텐츠
  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50">
      {/* 헤더 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            채팅 기록
          </span>
          {/* 데스크톱: 접기 버튼, 모바일: 닫기 버튼 */}
          <button
            onClick={() => {
              onToggle(false);
              setIsMobileOpen(false);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 md:block hidden"
          >
            <RiCloseLine className="text-lg" />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 md:hidden"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        <CreditsBadge credits={credits} />
      </div>

      {/* 새 채팅 버튼 */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
        >
          <RiAddLine className="text-lg" />새 채팅
        </button>
      </div>

      {/* 세션 목록 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            아직 채팅 기록이 없습니다
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`
                  group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                  ${
                    currentSessionId === session.id
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }
                `}
              >
                <RiChat3Line className="flex-shrink-0 text-lg" />
                <span className="flex-1 truncate text-sm">
                  {session.title || "새 채팅"}
                </span>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  disabled={deletingId === session.id}
                  className={`
                    flex-shrink-0 p-1 rounded transition-all
                    text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                    dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-900/20
                    opacity-100 md:opacity-0 md:group-hover:opacity-100
                    ${deletingId === session.id ? "!opacity-100" : ""}
                  `}
                >
                  {deletingId === session.id ? (
                    <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RiDeleteBinLine />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 데스크톱 토글 버튼 (사이드바 닫혔을 때) */}
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="hidden md:flex fixed left-4 top-16 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <RiMenuLine className="text-xl text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed left-4 top-16 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      >
        <RiMenuLine className="text-xl text-slate-600 dark:text-slate-300" />
      </button>

      {/* 데스크톱 사이드바 */}
      <div
        className={`
          hidden md:block fixed left-0 top-12 bottom-0 z-30
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0"}
        `}
      >
        {isOpen && (
          <div className="w-64 h-full border-r border-slate-200 dark:border-slate-700">
            {sidebarContent}
          </div>
        )}
      </div>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* 배경 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* 슬라이드 패널 */}
          <div className="absolute left-0 top-12 bottom-0 w-72 animate-slideInLeft">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

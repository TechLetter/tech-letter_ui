import apiClient from "./client";
import { ApiError, ErrorCode, fromEnvelope } from "./apiError";
import { getAccessToken } from "../utils/authToken";

/**
 * 채팅 API (04 §4.3, §5).
 *
 * 경로가 `/chatbot/*` 에서 `/chat/*` 로 옮겨졌고, 응답은 `ChatAnswer` 다 —
 * `credits` 가 객체이고 `session_id`·`message_id` 가 들어 있다.
 *
 * SSE 프레이밍은 그대로다. 파서를 고칠 필요가 없다.
 */

const chatApi = {
  // ── 세션 ──────────────────────────────────────────────────────
  getSessionList: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get("/api/v1/chat/sessions", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  createSession: async () => {
    const response = await apiClient.post("/api/v1/chat/sessions");
    return response.data;
  },

  getSessionDetail: async (sessionId) => {
    const response = await apiClient.get(`/api/v1/chat/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    await apiClient.delete(`/api/v1/chat/sessions/${sessionId}`);
  },

  /** `{items, total}` 봉투. 각 항목은 `{id, text}` 뿐이다. */
  getSuggestedQuestions: async () => {
    const response = await apiClient.get("/api/v1/chat/suggested-questions");
    return response.data.items || [];
  },

  // ── 대화 ──────────────────────────────────────────────────────
  sendChatRequest: async (query, sessionId, signal) => {
    const payload = sessionId ? { query, session_id: sessionId } : { query };
    const response = await apiClient.post("/api/v1/chat/messages", payload, { signal });
    return response.data;
  },

  streamChatRequest: async (query, sessionId, options = {}) => {
    const payload = sessionId ? { query, session_id: sessionId } : { query };

    const response = await fetch(buildApiUrl("/api/v1/chat/messages/stream"), {
      method: "POST",
      headers: buildStreamHeaders(),
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    // 가드·세션·크레딧 실패는 스트림이 아니라 JSON 에러로 온다(04 §5).
    if (!response.ok) {
      throw fromEnvelope(await readJson(response), response.status);
    }
    if (!response.body) {
      throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: "스트림 응답을 읽을 수 없습니다." });
    }

    return readChatStream(response.body, { onActivity: options.onActivity });
  },
};

const buildApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const buildStreamHeaders = () => {
  const headers = { "Content-Type": "application/json", Accept: "text/event-stream" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const readChatStream = async (body, { onActivity } = {}) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = null;

  const consume = (block) => {
    const event = parseStreamEvent(block);
    if (!event) return;
    if (event.type === "activity") onActivity?.(event.data);
    if (event.type === "done") answer = event.data;
    // `error` 프레임도 일반 에러와 같은 봉투다.
    if (event.type === "error") throw fromEnvelope(event.data);
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\n\n/);
    buffer = blocks.pop() || "";
    blocks.forEach(consume);
  }
  buffer += decoder.decode();
  if (buffer.trim()) consume(buffer);

  if (!answer) {
    throw new ApiError({
      code: ErrorCode.INTERNAL_ERROR,
      message: "챗봇 응답이 완료되지 않았습니다.",
    });
  }
  return answer;
};

/** `: keepalive` 처럼 `data:` 가 없는 블록은 무시한다. */
const parseStreamEvent = (block) => {
  let type = "message";
  const dataLines = [];

  block.split(/\r?\n/).forEach((line) => {
    if (line.startsWith("event:")) type = line.slice("event:".length).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice("data:".length).trimStart());
  });

  if (dataLines.length === 0) return null;
  try {
    return { type, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return null;
  }
};

/** 에러 코드 → 화면 문구. 프론트가 자체 문구를 갖는 코드만 적는다. */
const CHAT_MESSAGES = {
  [ErrorCode.CHAT_SESSION_NOT_FOUND]: "세션을 찾을 수 없습니다. 새 채팅을 시작해 주세요.",
  [ErrorCode.CREDIT_INSUFFICIENT]: "크레딧이 부족합니다. 내일 다시 시도해 주세요.",
  [ErrorCode.POLICY_BLOCKED]:
    "요청에 내부 지시 변경이나 민감 정보 요청으로 해석될 수 있는 내용이 있어 처리하지 않았습니다.",
  [ErrorCode.LLM_RATE_LIMITED]: "요청이 몰리고 있어요. 잠시 후 다시 시도해 주세요.",
  [ErrorCode.LLM_UNAVAILABLE]: "챗봇이 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.",
  [ErrorCode.AUTH_REQUIRED]: "로그인이 필요한 서비스입니다.",
  [ErrorCode.AUTH_INVALID_TOKEN]: "로그인이 만료되었어요. 다시 로그인해 주세요.",
};

export const chatErrorMessage = (error) => {
  if (!(error instanceof ApiError)) return "일시적인 오류가 발생했어요.";
  return CHAT_MESSAGES[error.code] || error.message;
};

export default chatApi;

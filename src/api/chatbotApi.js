import apiClient from "./client";

/**
 * Chatbot API 서비스
 * 챗봇 엔드포인트와의 모든 상호작용을 처리합니다.
 */
const chatbotApi = {
  // ─────────────────────────────────────────────────────────────
  // 세션 관리
  // ─────────────────────────────────────────────────────────────

  /**
   * 세션 목록 조회
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} pageSize - 페이지당 항목 수 (기본값: 20)
   * @returns {Promise<{total: number, page: number, page_size: number, items: Array}>}
   */
  getSessionList: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get("/api/v1/chatbot/sessions", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  /**
   * 새 세션 생성
   * @returns {Promise<{id: string, title: string, messages: Array, created_at: string, updated_at: string}>}
   */
  createSession: async () => {
    const response = await apiClient.post("/api/v1/chatbot/sessions");
    return response.data;
  },

  /**
   * 세션 상세 조회 (메시지 포함)
   * @param {string} sessionId - 세션 ID
   * @returns {Promise<{id: string, title: string, messages: Array, created_at: string, updated_at: string}>}
   */
  getSessionDetail: async (sessionId) => {
    const response = await apiClient.get(
      `/api/v1/chatbot/sessions/${sessionId}`
    );
    return response.data;
  },

  /**
   * 세션 삭제
   * @param {string} sessionId - 세션 ID
   * @returns {Promise<void>}
   */
  deleteSession: async (sessionId) => {
    await apiClient.delete(`/api/v1/chatbot/sessions/${sessionId}`);
  },

  // ─────────────────────────────────────────────────────────────
  // 채팅
  // ─────────────────────────────────────────────────────────────

  /**
   * 챗봇에게 질의를 전송하고 생성된 답변을 반환합니다.
   *
   * @param {string} query - 사용자의 질문.
   * @param {string} [sessionId] - 세션 ID (제공 시 해당 세션에 대화 저장)
   * @param {AbortSignal} [signal] - 요청 취소를 위한 옵션 시그널.
   * @returns {Promise<{answer: string, consumed_credits: number, remaining_credits: number}>}
   * @throws {Error} - 에러 코드에 따른 커스텀 에러.
   */
  sendChatRequest: async (query, sessionId, signal) => {
    try {
      const payload = { query };
      if (sessionId) {
        payload.session_id = sessionId;
      }

      const response = await apiClient.post("/api/v1/chatbot/chat", payload, {
        signal,
      });
      return response.data;
    } catch (error) {
      if (error.name === "CanceledError") {
        throw error;
      }
      throw handleChatbotError(error);
    }
  },
};

/**
 * API 에러 코드를 사용자 친화적인 메시지로 매핑합니다.
 * @param {Error} error
 * @returns {Error}
 */
const handleChatbotError = (error) => {
  const status = error.response?.status;
  const errorCode = error.response?.data?.error;

  let message = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

  if (status === 400) {
    if (errorCode === "invalid_session_id") {
      message = "세션을 찾을 수 없습니다. 새 채팅을 시작해 주세요.";
    } else {
      message = "입력값이 올바르지 않습니다. 확인 후 다시 시도해 주세요.";
    }
  } else if (
    status === 401 ||
    ["unauthorized", "auth_required"].includes(errorCode)
  ) {
    message = "로그인이 필요한 서비스입니다.";
  } else if (status === 402 || errorCode === "insufficient_credits") {
    message = "크레딧이 부족합니다.";
  } else if (status === 429 || errorCode === "rate_limited") {
    message = "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  } else if (status === 503 || errorCode === "chatbot_unavailable") {
    message = "챗봇 서비스가 일시적으로 불안정합니다.";
  }

  const customError = new Error(message);
  customError.status = status;
  customError.code = errorCode;
  return customError;
};

export default chatbotApi;

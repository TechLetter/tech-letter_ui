import apiClient from "./client";

/**
 * Chatbot API 서비스
 * 챗봇 엔드포인트와의 모든 상호작용을 처리합니다.
 */
const chatbotApi = {
  /**
   * 챗봇에게 질의를 전송하고 생성된 답변을 반환합니다.
   *
   * @param {string} query - 사용자의 질문.
   * @param {AbortSignal} [signal] - 요청 취소를 위한 옵션 시그널.
   * @returns {Promise<{answer: string}>} - 챗봇의 응답.
   * @throws {string} - 에러 코드에 따른 메시지.
   */
  sendChatRequest: async (query, signal) => {
    try {
      const response = await apiClient.post(
        "/api/v1/chatbot/chat",
        { query },
        { signal }
      );
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

  let message = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."; // 기본 500/알 수 없음

  if (status === 400 || errorCode === "invalid_request") {
    message = "입력값이 올바르지 않습니다. 확인 후 다시 시도해 주세요.";
  } else if (status === 401 || ["unauthorized", "auth_required"].includes(errorCode)) {
    message = "로그인이 필요한 서비스입니다.";
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

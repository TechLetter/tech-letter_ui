/**
 * API 에러 정규화.
 *
 * 에러 봉투는 한 가지다 — `{"error": {code, message, details?}}`.
 * 프론트는 **`code` 만 보고 분기**한다. 메시지 문자열을 부분 매칭하면
 * 서버 문구가 바뀔 때 조용히 깨진다.
 */

/** 에러 코드 카탈로그. */
export const ErrorCode = {
  REQUEST_INVALID: "request.invalid",
  AUTH_REQUIRED: "auth.required",
  AUTH_INVALID_TOKEN: "auth.invalid_token",
  AUTH_FORBIDDEN: "auth.forbidden",
  AUTH_SESSION_EXPIRED: "auth.session_expired",
  RESOURCE_NOT_FOUND: "resource.not_found",
  RESOURCE_CONFLICT: "resource.conflict",
  CREDIT_INSUFFICIENT: "credit.insufficient",
  CREDIT_ERROR: "credit.error",
  CHAT_SESSION_NOT_FOUND: "chat.session_not_found",
  POLICY_BLOCKED: "policy.blocked",
  LLM_RATE_LIMITED: "llm.rate_limited",
  LLM_UNAVAILABLE: "llm.unavailable",
  INTERNAL_ERROR: "internal.error",
};

const NETWORK_MESSAGE = "네트워크 연결을 확인해 주세요.";
const FALLBACK_MESSAGE = "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";

export class ApiError extends Error {
  constructor({ code, message, details, status }) {
    super(message || FALLBACK_MESSAGE);
    this.name = "ApiError";
    this.code = code || ErrorCode.INTERNAL_ERROR;
    this.details = details || {};
    this.status = status;
  }

  /** 중복 오류가 가리키는 필드 (`rss_url` | `url` | `text` | `link`). */
  get field() {
    return this.details.field;
  }

  is(...codes) {
    return codes.includes(this.code);
  }
}

/** axios 에러나 SSE `error` 프레임을 `ApiError` 로 바꾼다. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  // 취소는 오류가 아니다. 그대로 올려 호출자가 구분하게 둔다.
  if (error?.name === "CanceledError" || error?.name === "AbortError") {
    throw error;
  }

  if (!error?.response) {
    return new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: NETWORK_MESSAGE });
  }

  const { status, data } = error.response;
  return fromEnvelope(data, status);
}

/** `{error: {...}}` 봉투에서 만든다. SSE `error` 프레임도 같은 모양이다. */
export function fromEnvelope(payload, status) {
  const body = payload?.error;
  if (!body?.code) {
    return new ApiError({ code: ErrorCode.INTERNAL_ERROR, status });
  }
  return new ApiError({
    code: body.code,
    message: body.message,
    details: body.details,
    status,
  });
}

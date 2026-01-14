import client from "./client";

/**
 * Admin API 모듈
 * Base URL: /api/v1/admin
 */

const ADMIN_BASE = "/api/v1/admin";

// ============================================================
// Posts API
// ============================================================

/**
 * 포스트 목록 조회
 * @param {Object} params - { page, page_size, status_ai_summarized, status_embedded, blog_id }
 */
export async function getPosts(params = {}) {
  const {
    page = 1,
    page_size = 20,
    status_ai_summarized,
    status_embedded,
    blog_id,
  } = params;

  const queryParams = { page, page_size };
  if (status_ai_summarized !== undefined)
    queryParams.status_ai_summarized = status_ai_summarized;
  if (status_embedded !== undefined)
    queryParams.status_embedded = status_embedded;
  if (blog_id) queryParams.blog_id = blog_id;

  const response = await client.get(`${ADMIN_BASE}/posts`, {
    params: queryParams,
  });
  return response.data;
}

/**
 * 포스트 생성
 * @param {Object} data - { title, link, blog_id }
 */
export async function createPost(data) {
  const response = await client.post(`${ADMIN_BASE}/posts`, data);
  return response.data;
}

/**
 * 포스트 삭제
 * @param {string} id - 포스트 ID
 */
export async function deletePost(id) {
  const response = await client.delete(`${ADMIN_BASE}/posts/${id}`);
  return response.data;
}

/**
 * AI 요약 트리거
 * @param {string} id - 포스트 ID
 */
export async function triggerSummarize(id) {
  const response = await client.post(`${ADMIN_BASE}/posts/${id}/summarize`);
  return response.data;
}

/**
 * 임베딩 트리거
 * @param {string} id - 포스트 ID
 */
export async function triggerEmbed(id) {
  const response = await client.post(`${ADMIN_BASE}/posts/${id}/embed`);
  return response.data;
}

// ============================================================
// Blogs API
// ============================================================

/**
 * 블로그 목록 조회
 * @param {Object} params - { page, page_size }
 */
export async function getBlogs(params = {}) {
  const { page = 1, page_size = 100 } = params;
  const response = await client.get(`${ADMIN_BASE}/blogs`, {
    params: { page, page_size },
  });
  return response.data;
}

// ============================================================
// Users API
// ============================================================

/**
 * 사용자 목록 조회
 * @param {Object} params - { page, page_size }
 */
export async function getUsers(params = {}) {
  const { page = 1, page_size = 20 } = params;
  const response = await client.get(`${ADMIN_BASE}/users`, {
    params: { page, page_size },
  });
  return response.data;
}

/**
 * 크레딧 지급
 * @param {string} userCode - 사용자 코드 (예: "google:abc123")
 * @param {Object} data - { amount: number, expired_at: string (ISO 8601) }
 */
export async function grantCredit(userCode, data) {
  const response = await client.post(
    `${ADMIN_BASE}/users/${userCode}/credits`,
    data
  );
  return response.data;
}

// ============================================================
// Error Handler
// ============================================================

/**
 * Admin API 에러 핸들러
 * @param {Error} error - Axios 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
export function handleAdminError(error) {
  if (!error.response) {
    return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
  }

  const { status, data } = error.response;
  const serverMessage = data?.error || data?.message;

  switch (status) {
    case 400:
      return serverMessage || "잘못된 요청입니다.";
    case 401:
      return "인증이 필요합니다. 다시 로그인해주세요.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return serverMessage || "알 수 없는 오류가 발생했습니다.";
  }
}

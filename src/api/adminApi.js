import client from "./client";
import { ApiError, ErrorCode } from "./apiError";

/**
 * 어드민 API (04 §4.4).
 *
 * 모든 응답이 `{items, page, page_size, total, total_pages}` 또는
 * `{items, total}` 이다. 409 는 `details.field` 로 어떤 필드가 겹쳤는지
 * 알려준다 — 현행처럼 메시지를 문자열 매칭하지 않는다.
 */

const ADMIN_BASE = "/api/v1/admin";

const unwrap = (response) => response.data;

// ── Posts ───────────────────────────────────────────────────────
export async function getPosts({ page = 1, page_size = 20, summarized, embedded, blog_id, q } = {}) {
  return client
    .get(`${ADMIN_BASE}/posts`, { params: { page, page_size, summarized, embedded, blog_id, q } })
    .then(unwrap);
}

export const createPost = (data) => client.post(`${ADMIN_BASE}/posts`, data).then(unwrap);
export const deletePost = (id) => client.delete(`${ADMIN_BASE}/posts/${id}`).then(unwrap);
export const triggerSummarize = (id) =>
  client.post(`${ADMIN_BASE}/posts/${id}/summarize`).then(unwrap);
export const triggerEmbed = (id) => client.post(`${ADMIN_BASE}/posts/${id}/embed`).then(unwrap);

// ── Blogs ───────────────────────────────────────────────────────
export async function getBlogs({ page = 1, page_size = 100, is_active } = {}) {
  return client
    .get(`${ADMIN_BASE}/blogs`, { params: { page, page_size, is_active } })
    .then(unwrap);
}

export const createBlog = (data) => client.post(`${ADMIN_BASE}/blogs`, data).then(unwrap);
export const updateBlog = (id, data) => client.put(`${ADMIN_BASE}/blogs/${id}`, data).then(unwrap);
export const activateBlog = (id) =>
  client.post(`${ADMIN_BASE}/blogs/${id}/activate`).then(unwrap);

export const deleteBlog = (id, { delete_posts = false } = {}) =>
  client
    .delete(`${ADMIN_BASE}/blogs/${id}`, { params: { delete_posts: Boolean(delete_posts) } })
    .then(unwrap);

// ── Users ───────────────────────────────────────────────────────
export async function getUsers({ page = 1, page_size = 20 } = {}) {
  return client.get(`${ADMIN_BASE}/users`, { params: { page, page_size } }).then(unwrap);
}

/**
 * 크레딧 지급.
 *
 * `user_code` 는 `google:<uuid>` 라 경로에 넣기 전에 인코딩해야 한다.
 * 현행은 인코딩 없이 넣어 `:` 가 그대로 나갔다.
 */
export const grantCredit = (userCode, { amount, expires_at }) =>
  client
    .post(`${ADMIN_BASE}/users/${encodeURIComponent(userCode)}/credits`, { amount, expires_at })
    .then(unwrap);

// ── Suggested questions ─────────────────────────────────────────
// 경로가 `/admin/chatbot/suggested-questions` 에서 옮겨졌다.
export const getSuggestedQuestions = ({ include_inactive = true } = {}) =>
  client
    .get(`${ADMIN_BASE}/suggested-questions`, { params: { include_inactive } })
    .then(unwrap);

export const createSuggestedQuestion = (data) =>
  client.post(`${ADMIN_BASE}/suggested-questions`, data).then(unwrap);
export const updateSuggestedQuestion = (id, data) =>
  client.put(`${ADMIN_BASE}/suggested-questions/${id}`, data).then(unwrap);
export const deleteSuggestedQuestion = (id) =>
  client.delete(`${ADMIN_BASE}/suggested-questions/${id}`).then(unwrap);

// ── Ops: 잡 큐 (신설, 04 §4.4) ──────────────────────────────────
export const getJobs = ({ page = 1, page_size = 50, status, type } = {}) =>
  client
    .get(`${ADMIN_BASE}/jobs`, {
      params: { page, page_size, status, type },
    })
    .then(unwrap);

export const getJobStats = () => client.get(`${ADMIN_BASE}/jobs/stats`).then(unwrap);
export const retryJob = (id) => client.post(`${ADMIN_BASE}/jobs/${id}/retry`).then(unwrap);
export const retryJobsBulk = (body) =>
  client.post(`${ADMIN_BASE}/jobs/retry-bulk`, body).then(unwrap);
export const deleteJob = (id) => client.delete(`${ADMIN_BASE}/jobs/${id}`).then(unwrap);

// ── Ops: 모델 성적 · 백필 (신설) ────────────────────────────────
export const getLlmModels = ({ purpose } = {}) =>
  client.get(`${ADMIN_BASE}/llm-models`, { params: { purpose } }).then(unwrap);

export const getBackfillStatus = () =>
  client.get(`${ADMIN_BASE}/backfill/summary`).then(unwrap);
export const runSummaryBackfill = (body) =>
  client.post(`${ADMIN_BASE}/backfill/summary`, body).then(unwrap);
export const runEmbeddingBackfill = (body) =>
  client.post(`${ADMIN_BASE}/backfill/embeddings`, body).then(unwrap);

// ── 에러 문구 ───────────────────────────────────────────────────
const CONFLICT_MESSAGES = {
  rss_url: "이미 등록된 RSS URL입니다.",
  url: "이미 등록된 블로그 URL입니다.",
  text: "이미 등록된 추천 질문입니다.",
  link: "이미 등록된 포스트 링크입니다.",
};

/** `ApiError` 를 어드민 화면에 띄울 문구로 바꾼다. */
export function handleAdminError(error) {
  if (!(error instanceof ApiError)) {
    return "알 수 없는 오류가 발생했습니다.";
  }
  if (error.code === ErrorCode.RESOURCE_CONFLICT) {
    return CONFLICT_MESSAGES[error.field] || error.message;
  }
  if (error.code === ErrorCode.AUTH_FORBIDDEN) {
    return "접근 권한이 없습니다.";
  }
  // 서버가 사용자 표시용 한국어 문구를 준다. 자체 문구가 없으면 그대로 쓴다.
  return error.message;
}

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  LOGIN_SUCCESS: "/login/success",
  BOOKMARKS: "/bookmarks",
  TRENDS: "/trends",
  MODEL_STATUS: "/models",
  CHATBOT: "/chatbot",
  ADMIN: "/admin",
  PRIVACY: "/privacy",
  POST_DETAIL: "/posts/:id",
};

/** 글 "쉽게 읽기" 상세 경로. 카드·검색·트렌드가 모두 이걸로 이동한다. */
export const postDetailPath = (id) => `/posts/${id}`;

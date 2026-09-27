/** 검색 단축키 표기. 동작은 ⌘K·Ctrl+K 둘 다 받고(SearchOverlayProvider), 표기만 운영체제에 맞춘다. */
const isApple =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);

export const SEARCH_SHORTCUT = isApple ? "⌘K" : "Ctrl K";

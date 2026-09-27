let openHandler = null;

// 모바일 헤더의 햄버거 버튼이 홈의 필터 드로어를 연다. 드로어 상태는 홈이 가진다.
export function bindMobileFilterHandler(handler) {
  openHandler = handler;
}

export function unbindMobileFilterHandler() {
  openHandler = null;
}

export function openMobileFilter() {
  if (openHandler) openHandler();
}

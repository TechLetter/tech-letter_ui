let openSearchHandler = null;

// 헤더·하단 탭·빈 결과 화면 등 어디서든 검색을 열 수 있게 트리거를 밖으로 뺀다.
export function bindSearchOverlayHandler(handler) {
  openSearchHandler = handler;
}

export function unbindSearchOverlayHandler() {
  openSearchHandler = null;
}

export function openSearch(initialQuery = "") {
  if (openSearchHandler) openSearchHandler(initialQuery);
}

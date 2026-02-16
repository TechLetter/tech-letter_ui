let openLoginRequiredModalHandler = null;

// Why: Provider 파일의 Fast Refresh 경고를 피하기 위해
// 외부 트리거 함수를 컴포넌트 파일 밖으로 분리한다.
export function bindLoginRequiredModalHandler(handler) {
  openLoginRequiredModalHandler = handler;
}

export function unbindLoginRequiredModalHandler() {
  openLoginRequiredModalHandler = null;
}

export function showLoginRequiredModal() {
  if (openLoginRequiredModalHandler) {
    openLoginRequiredModalHandler();
  }
}

let toastModalHandler = null;

// Why: Fast Refresh 규칙(컴포넌트 파일은 컴포넌트만 export)을 지키기 위해
// 외부에서 호출하는 토스트 API를 별도 파일로 분리한다.
export function bindToastModalHandler(handler) {
  toastModalHandler = handler;
}

export function unbindToastModalHandler() {
  toastModalHandler = null;
}

export function showToast(message) {
  if (toastModalHandler) {
    toastModalHandler(message);
  }
}

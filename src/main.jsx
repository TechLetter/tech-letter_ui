import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./provider/AuthProvider";
import { ThemeProvider } from "./provider/ThemeProvider";

// 배포하면 청크 이름이 바뀐다. 배포 전에 열어 둔 탭이 옛 청크를 부르다 실패하면
// 새 index.html을 받도록 한 번 새로고침한다. 10초 안에 또 실패하면 반복하지 않는다.
window.addEventListener("vite:preloadError", (event) => {
  const key = "TECHLETTER_CHUNK_RELOAD_AT";
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(key)) || 0;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // 저장소를 못 쓰면 반복 방지 없이 한 번 새로고침한다.
  }
  if (Date.now() - last < 10_000) return;
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

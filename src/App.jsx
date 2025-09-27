import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Suspense } from "react";
import { ROUTES } from "./routes/router";
import { ModalProvider } from "./provider/ModalProvider";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModalProvider />
      <Routes>
        <Route element={<MainLayout />}>
          {ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

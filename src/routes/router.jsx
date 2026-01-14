import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PATHS } from "./path";
import AdminRouteProvider from "../provider/AdminRouteProvider";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const LoginSuccess = lazy(() => import("../pages/LoginSuccess"));
const Bookmarks = lazy(() => import("../pages/Bookmarks"));
const Chatbot = lazy(() => import("../pages/Chatbot"));
const Admin = lazy(() => import("../pages/Admin"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));

export const ROUTES = [
  { path: PATHS.HOME, element: <Home /> },
  { path: PATHS.LOGIN, element: <Login /> },
  { path: PATHS.LOGIN_SUCCESS, element: <LoginSuccess /> },
  { path: PATHS.BOOKMARKS, element: <Bookmarks /> },
  { path: PATHS.CHATBOT, element: <Chatbot /> },
  {
    path: PATHS.ADMIN,
    element: (
      <AdminRouteProvider>
        <Admin />
      </AdminRouteProvider>
    ),
  },
  { path: PATHS.PRIVACY, element: <PrivacyPolicy /> },
  // Catch-all: 정의되지 않은 모든 경로는 홈으로 리다이렉트
  { path: "*", element: <Navigate to={PATHS.HOME} replace /> },
];

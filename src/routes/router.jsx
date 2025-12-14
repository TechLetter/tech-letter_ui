import { lazy } from "react";
import { PATHS } from "./path";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const LoginSuccess = lazy(() => import("../pages/LoginSuccess"));
const Bookmarks = lazy(() => import("../pages/Bookmarks"));
const Chatbot = lazy(() => import("../pages/Chatbot"));
const Admin = lazy(() => import("../pages/Admin"));

export const ROUTES = [
  { path: PATHS.HOME, element: <Home /> },
  { path: PATHS.LOGIN, element: <Login /> },
  { path: PATHS.LOGIN_SUCCESS, element: <LoginSuccess /> },
  { path: PATHS.BOOKMARKS, element: <Bookmarks /> },
  { path: PATHS.CHATBOT, element: <Chatbot /> },
  { path: PATHS.ADMIN, element: <Admin /> },
];

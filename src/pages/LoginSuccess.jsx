import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PATHS } from "../routes/path";
import { useAuth } from "../provider/AuthProvider";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("로그인 처리 중입니다...");
  const handledTokenRef = useRef(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 로그인 요청입니다. 다시 시도해 주세요.");
      return;
    }

    if (handledTokenRef.current === token) {
      return;
    }
    handledTokenRef.current = token;

    const handleLogin = async () => {
      try {
        await loginWithToken(token);
        setStatus("success");
        setMessage("로그인에 성공했어요. 잠시 후 홈으로 이동합니다.");
        setTimeout(() => {
          navigate(PATHS.HOME, { replace: true });
        }, 1200);
      } catch (error) {
        setStatus("error");
        setMessage(
          "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        );
      }
    };

    handleLogin();
  }, [loginWithToken, navigate, searchParams]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white/90 p-6 text-center shadow-lg">
        <div className="mb-4">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-green-100 text-green-600"
                : isError
                ? "bg-red-100 text-red-600"
                : "bg-indigo-100 text-indigo-600"
            }`}
          >
            {isSuccess ? "✔" : isError ? "!" : "…"}
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        {isError && (
          <button
            type="button"
            onClick={() => navigate(PATHS.LOGIN)}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            다시 로그인하기
          </button>
        )}
      </div>
    </div>
  );
}

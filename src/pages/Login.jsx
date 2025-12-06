import GoogleLoginButton from "../components/auth/GoogleLoginButton";

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white/90 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tech Letter 로그인
          </h1>
          <p className="text-sm text-gray-600">
            Google 계정으로 간편하게 로그인하고, 개인화된 구독 경험을
            즐겨보세요.
          </p>
        </div>
        <div className="space-y-4">
          <GoogleLoginButton />
          <p className="text-xs text-gray-400 text-center">
            로그인 시 서비스 이용 약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

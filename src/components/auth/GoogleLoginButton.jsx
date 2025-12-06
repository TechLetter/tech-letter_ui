import authApi from "../../api/authApi";

export default function GoogleLoginButton() {
  const handleClick = () => {
    const url = authApi.getGoogleLoginUrl();
    window.location.href = url;
  };

  return (
    <div className="relative w-full rounded-xl p-[1px] overflow-hidden group">
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gray-300" />
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <button
        type="button"
        onClick={handleClick}
        className="relative z-10 w-full flex items-center justify-center gap-2 rounded-[0.7rem] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white text-xs font-bold text-indigo-500 border border-gray-200">
          G
        </span>
        <span>Google 계정으로 계속하기</span>
      </button>
    </div>
  );
}

import authApi from "../../api/authApi";
import googleIcon from "../../assets/google.svg";

export default function GoogleLoginButton() {
  const handleClick = () => {
    const url = authApi.getGoogleLoginUrl();
    window.location.href = url;
  };

  return (
    <div className="relative w-full rounded-xl p-[1px] overflow-hidden group">
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gray-300 dark:bg-slate-600" />
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <button
        type="button"
        onClick={handleClick}
        className="relative z-10 flex w-full items-center justify-center gap-2 rounded-[0.7rem] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <img className="h-4 w-4" src={googleIcon} alt="Google" />
        <span className="text-sm sm:text-base leading-tight">
          Google 계정으로 계속하기
        </span>
      </button>
    </div>
  );
}

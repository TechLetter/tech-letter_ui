import { Link } from "react-router-dom";
import { PATHS } from "../../routes/path";

export default function AppFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-2 px-4 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Tech Letter</p>
        <Link to={PATHS.PRIVACY} className="flex h-11 items-center sm:h-auto">
          <span className="font-medium text-ink-2 hover:text-accent-ink">개인정보처리방침</span>
        </Link>
      </div>
    </footer>
  );
}

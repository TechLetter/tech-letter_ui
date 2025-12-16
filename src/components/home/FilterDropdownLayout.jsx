import React from "react";

export default function FilterDropdownLayout({ children, gridClassName }) {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-2xl">
      <div className="relative rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg shadow-indigo-100/40 backdrop-blur-sm animate-fadeIn dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-slate-900/50">
        <div className="absolute left-8 -top-2 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white/95 shadow-sm dark:border-slate-700 dark:bg-slate-800/95" />
        <div className={gridClassName}>{children}</div>
      </div>
    </div>
  );
}

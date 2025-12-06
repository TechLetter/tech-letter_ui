import React from "react";

export default function FilterDropdownLayout({ children, gridClassName }) {
  return (
    <div className="absolute left-0 top-full mt-2 z-20 w-full max-w-2xl border border-gray-200 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn">
      <div className={gridClassName}>{children}</div>
    </div>
  );
}

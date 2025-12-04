import React from "react";

export default function FilterDropdownLayout({ children, gridClassName }) {
  return (
    <div
      className="absolute top-full mt-2 z-20 w-[90vw] max-w-md sm:max-w-lg left-1/2 -translate-x-1/2
        border border-gray-200 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl animate-fadeIn"
    >
      <div className={gridClassName}>{children}</div>
    </div>
  );
}

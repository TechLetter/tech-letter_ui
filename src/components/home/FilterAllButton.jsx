import React from "react";

export default function FilterAllButton({ onClick, fullWidth = false }) {
  const widthClassName = fullWidth ? "w-full " : "";
  const baseClassName =
    "px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300";

  return (
    <button onClick={onClick} className={widthClassName + baseClassName}>
      All
    </button>
  );
}

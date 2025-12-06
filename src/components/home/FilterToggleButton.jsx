import React from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function FilterToggleButton({ label, isOpen, onClick }) {
  const baseClassName =
    "w-28 sm:w-36 md:w-40 flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.98]";
  const openedClassName =
    "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm hover:bg-indigo-100";
  const closedClassName =
    "bg-white border-gray-300 text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow-md";

  const buttonClassName = `${baseClassName} ${
    isOpen ? openedClassName : closedClassName
  }`;
  const iconClassName = isOpen ? "text-indigo-500" : "text-gray-600";

  return (
    <button onClick={onClick} className={buttonClassName}>
      <span className="truncate">{label}</span>
      {isOpen ? (
        <IoChevronUp size={20} className={iconClassName} />
      ) : (
        <IoChevronDown size={20} className={iconClassName} />
      )}
    </button>
  );
}

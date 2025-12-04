import React from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function FilterToggleButton({ label, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-28 sm:w-36 md:w-40 flex items-center justify-between px-3 py-2.5
       border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 
       shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
    >
      <span className="text-gray-800 font-semibold text-sm truncate">
        {label}
      </span>
      {isOpen ? (
        <IoChevronUp size={20} className="text-gray-600" />
      ) : (
        <IoChevronDown size={20} className="text-gray-600" />
      )}
    </button>
  );
}

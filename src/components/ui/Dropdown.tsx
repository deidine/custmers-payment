"use client";
import { useState } from "react";

interface DropdownProps {
  options: string[];
  onSelect: (value: string) => void;
  className?: string;
}

export default function Dropdown({
  options,
  onSelect,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(options[0]);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left min-w-[200px] ${
        className || ""
      }`}
    >
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-[200px] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="truncate">{selected}</span>
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06 0L10 10.938l3.71-3.728a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full max-h-[320px] overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="none">
            {options.map((value) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

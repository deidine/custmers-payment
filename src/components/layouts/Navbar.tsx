"use client";
import Link from "next/link";
import { useState } from "react";

import { useUser } from "@/contexts/UserContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const isAllowed = user && (user.role === "ADMIN" || user.role === "MANAGER");

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        {/* Hamburger menu button for small screens */}
        <div className="sm:hidden mr-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>

    
        <div className="flex items-center gap-4">
          {/* Require permission to access */}
          {isAllowed && (
            <Link
              href={"/dashboard"}
              className="bg-red-800 px-2 py-1 rounded text-white hover:bg-red-500 block"
            >
              Dashboard
            </Link>
          )}
 
        </div>
      </div>
    </nav>
  );
}

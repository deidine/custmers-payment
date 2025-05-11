"use client";
import { useState } from "react";
import SearchIcon from "../../public/images/search-alt.svg";

// TODO: Implement fetch logic
export default function SearchBar({
  initValue,
  placeholder,
  onSearch,
}: {
  initValue?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState(initValue || "");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative flex items-center w-96 sm:w-1/2 lg:w-80">
      <input
        className="pr-10 w-full border border-gray-400 rounded-lg px-4 py-2"
        type="text"
        placeholder={
          placeholder || "Tên thuốc, thực phẩm chức năng, thiết bị y tế"
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyUp={handleKeyPress}
      />
      <button
        className="absolute right-0 top-0 h-full w-10 rounded-r-lg bg-gray-800 hover:bg-gray-600 border border-gray-400 px-2"
        onClick={handleSearch}
      >
        <SearchIcon className="w-5 h-5" fill="none" stroke="#FFFFFF" />
      </button>
    </div>
  );
}

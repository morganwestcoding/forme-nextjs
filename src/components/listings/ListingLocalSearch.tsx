// components/listings/ListingLocalSearch.tsx
"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface ListingLocalSearchProps {
  placeholder?: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const ListingLocalSearch: React.FC<ListingLocalSearchProps> = ({
  placeholder = "Search services, team, posts...",
  onSearchChange,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearchChange("");
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-12 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 hover:border-gray-300 text-gray-700 placeholder-gray-500 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
          type="button"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ListingLocalSearch;

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
        <Search className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-12 text-sm bg-transparent border border-white/30 hover:border-white/50 focus:border-white/50 rounded-xl outline-none text-white placeholder-white/60 transition-all duration-300"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-white/60 hover:text-white transition-colors duration-300 z-10"
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

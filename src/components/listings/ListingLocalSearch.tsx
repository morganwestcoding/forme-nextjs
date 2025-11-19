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
        <Search className="w-5 h-5 text-white/70" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-12 text-sm bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl outline-none focus:ring-1 focus:ring-white/60 focus:border-white/60 hover:bg-white/20 text-white placeholder-white/70 transition-all duration-200"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-white/70 hover:text-white transition-colors z-10"
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

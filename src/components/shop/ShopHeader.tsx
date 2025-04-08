'use client';

import { useState } from 'react';
import { SafeProductCategory } from '@/app/types';

interface ShopHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchQuery?: string;
  };
  onFilterChange: (filters: any) => void;
  categories?: SafeProductCategory[];
}

const ShopHeader: React.FC<ShopHeaderProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  categories = []
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      searchQuery
    });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let sortBy, sortOrder;

    switch (value) {
      case 'price_asc':
        sortBy = 'price';
        sortOrder = 'asc';
        break;
      case 'price_desc':
        sortBy = 'price';
        sortOrder = 'desc';
        break;
      case 'newest':
        sortBy = 'date';
        sortOrder = 'desc';
        break;
      case 'popular':
        sortBy = 'popular';
        sortOrder = 'desc';
        break;
    }

    onFilterChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };

  return (
    <div className="border rounded-xl p-4 bg-white mb-6">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-4 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-48">
          <select
            className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            onChange={handleSortChange}
            defaultValue="newest"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-2.5 flex items-center justify-center ${
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-2.5 flex items-center justify-center ${
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.category === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.category === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            {category.productCount !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-600 bg-opacity-20">
                {category.productCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShopHeader;
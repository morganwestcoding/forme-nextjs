'use client';

import { useState } from 'react';
import Search from '@/components/header/Search';
import { categories } from '@/components/Categories';

interface Category {
  label: string;
  icon: string;
  description: string;
}

interface MarketHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
  };
  onFilterChange: (filters: MarketHeaderProps['filters']) => void;
}
  
const MarketHeader = ({ 
  viewMode, 
  onViewModeChange,
  filters,
  onFilterChange 
}: MarketHeaderProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = (newFilters: any) => {
    onFilterChange({ ...filters, ...newFilters });
    setIsFilterOpen(false);
  };

  return (
    <div className="w-full py-6 mt-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Search />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Label and Button with Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                flex items-center gap-2 py-3 px-4 rounded-md bg-slate-500
                transition-colors duration-200 ease-in-out
                ${isFilterOpen ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="none"
                className="text-current"
              >
                <path 
                  d="M8.85746 12.5061C6.36901 10.6456 4.59564 8.59915 3.62734 7.44867C3.3276 7.09253 3.22938 6.8319 3.17033 6.3728C2.96811 4.8008 2.86701 4.0148 3.32795 3.5074C3.7889 3 4.60404 3 6.23433 3H17.7657C19.396 3 20.2111 3 20.672 3.5074C21.133 4.0148 21.0319 4.8008 20.8297 6.37281C20.7706 6.83191 20.6724 7.09254 20.3726 7.44867C19.403 8.60062 17.6261 10.6507 15.1326 12.5135C14.907 12.6821 14.7583 12.9567 14.7307 13.2614C14.4837 15.992 14.2559 17.4876 14.1141 18.2442C13.8853 19.4657 12.1532 20.2006 11.226 20.8563C10.6741 21.2466 10.0043 20.782 9.93278 20.1778C9.79643 19.0261 9.53961 16.6864 9.25927 13.2614C9.23409 12.9539 9.08486 12.6761 8.85746 12.5061Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <span className="text-current text-sm">Filter</span>
            </button>

            {/* Filter Menu */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
                <div className="space-y-4">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select 
                      value={filters.category}
                      onChange={(e) => handleFilterChange({ category: e.target.value })}
                      className="w-full border border-gray-200 rounded-md py-1.5 px-3 text-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.label} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                        placeholder="Min"
                        className="w-1/2 border border-gray-200 rounded-md py-1.5 px-3 text-sm"
                      />
                      <input 
                        type="number" 
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                        placeholder="Max"
                        className="w-1/2 border border-gray-200 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select 
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                      className="w-full border border-gray-200 rounded-md py-1.5 px-3 text-sm"
                    >
                      <option value="date">Date</option>
                      <option value="price">Price</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleFilterChange({
                        category: 'all',
                        minPrice: undefined,
                        maxPrice: undefined,
                        sortBy: undefined,
                        sortOrder: undefined
                      })}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="px-3 py-1.5 text-sm bg-[#F9AE8B] text-white rounded-md"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Toggle Buttons */}
          <div className="relative bg-slate-500 rounded-md px-2">
            <div className="flex items-center relative">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`
                  py-3 px-4 relative z-10 cursor-pointer select-none
                  transition-colors duration-200 ease-in-out
                  ${viewMode === 'grid' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="20" 
                  height="20" 
                  fill="none"
                  className="transition-colors duration-200"
                >
                  <path d="M2 18C2 16.4596 2 15.6893 2.34673 15.1235C2.54074 14.8069 2.80693 14.5407 3.12353 14.3467C3.68934 14 4.45956 14 6 14C7.54044 14 8.31066 14 8.87647 14.3467C9.19307 14.5407 9.45926 14.8069 9.65327 15.1235C10 15.6893 10 16.4596 10 18C10 19.5404 10 20.3107 9.65327 20.8765C9.45926 21.1931 9.19307 21.4593 8.87647 21.6533C8.31066 22 7.54044 22 6 22C4.45956 22 3.68934 22 3.12353 21.6533C2.80693 21.4593 2.54074 21.1931 2.34673 20.8765C2 20.3107 2 19.5404 2 18Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 18C14 16.4596 14 15.6893 14.3467 15.1235C14.5407 14.8069 14.8069 14.5407 15.1235 14.3467C15.6893 14 16.4596 14 18 14C19.5404 14 20.3107 14 20.8765 14.3467C21.1931 14.5407 21.4593 14.8069 21.6533 15.1235C22 15.6893 22 16.4596 22 18C22 19.5404 22 20.3107 21.6533 20.8765C21.4593 21.1931 21.1931 21.4593 20.8765 21.6533C20.3107 22 19.5404 22 18 22C16.4596 22 15.6893 22 15.1235 21.6533C14.8069 21.4593 14.5407 21.1931 14.3467 20.8765C14 20.3107 14 19.5404 14 18Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 6C2 4.45956 2 3.68934 2.34673 3.12353C2.54074 2.80693 2.80693 2.54074 3.12353 2.34673C3.68934 2 4.45956 2 6 2C7.54044 2 8.31066 2 8.87647 2.34673C9.19307 2.54074 9.45926 2.80693 9.65327 3.12353C10 3.68934 10 4.45956 10 6C10 7.54044 10 8.31066 9.65327 8.87647C9.45926 9.19307 9.19307 9.45926 8.87647 9.65327C8.31066 10 7.54044 10 6 10C4.45956 10 3.68934 10 3.12353 9.65327C2.80693 9.45926 2.54074 9.19307 2.34673 8.87647C2 8.31066 2 7.54044 2 6Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 6C14 4.45956 14 3.68934 14.3467 3.12353C14.5407 2.80693 14.8069 2.54074 15.1235 2.34673C15.6893 2 16.4596 2 18 2C19.5404 2 20.3107 2 20.8765 2.34673C21.1931 2.54074 21.4593 2.80693 21.6533 3.12353C22 3.68934 22 4.45956 22 6C22 7.54044 22 8.31066 21.6533 8.87647C21.4593 9.19307 21.1931 9.45926 20.8765 9.65327C20.3107 10 19.5404 10 18 10C16.4596 10 15.6893 10 15.1235 9.65327C14.8069 9.45926 14.5407 9.19307 14.3467 8.87647C14 8.31066 14 7.54044 14 6Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              
              <button
                onClick={() => onViewModeChange('list')}
                className={`
                  py-3 px-4 relative z-10 cursor-pointer select-none
                  transition-colors duration-200 ease-in-out
                  ${viewMode === 'list' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="20" 
                  height="20" 
                  fill="none"
                  className="transition-colors duration-200"
                >
                  <path d="M8 5L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4 5H4.00898" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12H4.00898" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 19H4.00898" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 19L20 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Animated Indicator */}
              <div
                className="absolute bottom-0 h-1 bg-[#78C3FB] rounded-t-sm transition-all duration-300 ease-in-out"
                style={{
                  width: '50%',
                  left: viewMode === 'list' ? '50%' : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
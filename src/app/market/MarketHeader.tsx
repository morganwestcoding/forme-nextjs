'use client';

import { useState } from 'react';
import Search from '@/components/header/Search';
import Filter from './Filter';
import { useColorContext } from '@/app/context/ColorContext';
import ModernCategoryFilter from './ModernCategoryFilter';

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
  const [hoverState, setHoverState] = useState<string | null>(null);

  const handleFilterChange = (newFilters: any) => {
    onFilterChange({ ...filters, ...newFilters });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category
    });
  };

  return (
    <div className="py-6 px-6 rounded-2xl transition-colors duration-250 border">
      {/* First row: heading / search / grid / sort */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side with title and search */}
        <div className="flex items-center flex-1">
          {/* Title and subtitle */}
          <div className="hidden sm:block mr-4">
            <h1 className="text-xl font-semibold text-neutral-800">Marketplace</h1>
            <p className="text-sm text-neutral-500">Discover Listings</p>
          </div>
          
          {/* Search component */}
          <div className="w-full max-w-xl">
            <Search />
          </div>
        </div>
        
        {/* Right side with view toggle and sort */}
        <div className="flex items-center gap-3 -mb-3">
          {/* View mode selector */}
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">            
            <button
              className={`py-3 px-5 rounded-lg rounded-r-none text-sm font-medium transition-all duration-200 border border-gray-200 ${viewMode === 'grid' ? 'bg-white text-neutral-800' : 'bg-gray-100 text-neutral-500 hover:bg-gray-50'}`}
              onClick={() => onViewModeChange('grid')}
              onMouseEnter={() => setHoverState('grid')}
              onMouseLeave={() => setHoverState(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            
            <button
              className={`py-3.5 px-5 rounded-lg rounded-l-none text-sm font-medium transition-all duration-200 border border-l-0 border-gray-200 ${viewMode === 'list' ? 'bg-white text-neutral-800' : 'bg-gray-100 text-neutral-500 hover:bg-gray-50'}`}
              onClick={() => onViewModeChange('list')}
              onMouseEnter={() => setHoverState('list')}
              onMouseLeave={() => setHoverState(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Sort button */}
          <button 
            className="py-3 px-4 w-28 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 bg-gray-100 hover:bg-gray-50 text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
            <span>Sort</span>
          </button>
        </div>
      </div>
      
      {/* Second row: category filters / filter button */}
      <div className="flex items-center justify-between">
        {/* Category filter */}
        <div className="flex-1">
          <ModernCategoryFilter 
            selectedCategory={filters.category} 
            onCategoryChange={handleCategoryChange} 
          />
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {/* Compare button */}
          <button className="flex items-center justify-center gap-2 py-3 px-4 w-28 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 bg-gray-100 hover:bg-gray-50 text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>Trending</span>
          </button>
          
          {/* Filter button wrapper - style adjustments will be in Filter component */}
          <div className='w-28'>
            <Filter onApplyFilter={(filterValues) => {
              const { category, price } = filterValues;
              handleFilterChange({ 
                category,
                minPrice: price === 'low' ? 0 : price === 'medium' ? 50 : price === 'high' ? 100 : undefined,
                maxPrice: price === 'low' ? 50 : price === 'medium' ? 100 : price === 'high' ? undefined : undefined
              });
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
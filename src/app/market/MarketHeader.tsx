'use client';

import { useState, useEffect } from 'react';
import Search from '@/components/header/Search';
import Filter from './Filter';
import ModernCategoryFilter from './ModernCategoryFilter';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

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
  const searchParams = useSearchParams();
  const selectedCategory = searchParams?.get('category') || filters.category;

  const handleFilterChange = (newFilters: any) => {
    onFilterChange({ ...filters, ...newFilters });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category
    });
  };

  const handleSortChange = (sortOptions: { sortBy: 'price' | 'date' | 'name', sortOrder: 'asc' | 'desc' }) => {
    onFilterChange({
      ...filters,
      ...sortOptions
    });
  };
  
  // Function to get category color
  const getCategoryColor = (categoryName: string) => {
    // Find the category in the categories array
    const categoryObj = categories.find(
      cat => cat.label === categoryName
    );
    
    if (categoryObj) {
      // Extract the hex color from the bg-[#XXXXXX] format
      const colorMatch = categoryObj.color.match(/#[0-9A-Fa-f]{6}/);
      if (colorMatch) {
        return colorMatch[0];
      }
    }
    
    // Return a default color if not found
    return '#60A5FA';
  };
  
  // Get the active button color based on selected category
  const activeButtonColor = selectedCategory && selectedCategory !== 'Default' 
    ? getCategoryColor(selectedCategory)
    : '#60A5FA';

  return (
    <div className="py-6 px-6 rounded-2xl transition-colors duration-250 bg-gray-100">
      {/* First row: search / view toggle / filter / sort */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side with search */}
        <div className="flex-1 pr-4 ">
          <Search />
        </div>
        
        {/* Right side with view toggle, filter and sort */}
        <div className="flex items-center gap-3">
          {/* View mode selector */}
          <div className="flex rounded-xl bg-white overflow-hidden">            
            <button
              className={`flex items-center justify-center h-full py-4 px-5 rounded-xl rounded-r-none text-xs font-medium transition-all duration-200 
                ${viewMode === 'grid' 
                  ? 'text-white' 
                  : 'bg-white text-neutral-500 hover:bg-gray-50'}`}
              style={{
                backgroundColor: viewMode === 'grid' ? activeButtonColor : '',
              }}
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
              className={`flex items-center justify-center h-full py-4 px-5 rounded-xl-r ounded-l-none text-xs font-medium transition-all duration-200 
                ${viewMode === 'list' 
                  ? 'text-white' 
                  : 'bg-gray-400 text-white hover:bg-gray-50'}`}
              style={{
                backgroundColor: viewMode === 'list' ? activeButtonColor : '',
              }}
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
          
          {/* Filter button */}
          <div className="h-12">
            <Filter onApplyFilter={(filterValues) => {
              const { category, price } = filterValues;
              handleFilterChange({ 
                category,
                minPrice: price === 'low' ? 0 : price === 'medium' ? 50 : price === 'high' ? 100 : undefined,
                maxPrice: price === 'low' ? 50 : price === 'medium' ? 100 : price === 'high' ? undefined : undefined
              });
            }} />
          </div>
          
          {/* Sort button */}
          <button 
            className="flex items-center justify-center py-4 px-4 w-24 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm text-white"
            style={{
              backgroundColor: activeButtonColor
            }}
            onClick={() => {
              // Toggle between ascending and descending for the current sort field
              // or default to sorting by date in descending order
              const currentSortBy = filters.sortBy || 'date';
              const currentSortOrder = filters.sortOrder || 'desc';
              handleSortChange({
                sortBy: currentSortBy,
                sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc'
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
            <span>Sort</span>
          </button>
        </div>
      </div>
      
      {/* Second row: category filters */}
      <div className="flex items-center">
        {/* Category filter */}
        <div className="flex-1">
          <ModernCategoryFilter 
            selectedCategory={filters.category} 
            onCategoryChange={handleCategoryChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
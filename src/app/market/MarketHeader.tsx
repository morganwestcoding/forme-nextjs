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
  
  // Function to darken a hex color by a factor
  const darkenColor = (hex: string, factor: number = 0.15) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Darken each component
    r = Math.max(0, Math.floor(r * (1 - factor)));
    g = Math.max(0, Math.floor(g * (1 - factor)));
    b = Math.max(0, Math.floor(b * (1 - factor)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Get the active button color based on selected category
  const activeButtonColor = selectedCategory && selectedCategory !== 'Default' 
    ? getCategoryColor(selectedCategory)
    : '#60A5FA';
    
  const buttonHoverColor = darkenColor(activeButtonColor, 0.15);

  return (
    <div className="py-6 px-6 rounded-2xl transition-colors duration-250 bg-gradient-to-b from-gray-100 to-gray-200">
      {/* First row: search / view toggle / filter / sort */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side with search */}
        <div className="flex-1 pr-4">
          <Search />
        </div>
        
        {/* Right side with view toggle, filter and sort */}
        <div className="flex items-center gap-3">
          {/* View mode selector - redesigned with rounded edges */}
          <div className="flex rounded-xl bg-white overflow-hidden shadow-sm h-12">            
            <button
              className={`flex items-center justify-center py-3 px-4 rounded-xl text-xs font-medium transition-all duration-300
                ${viewMode === 'grid' 
                  ? 'text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              style={{
                backgroundColor: viewMode === 'grid' ? activeButtonColor : '',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
              }}
              onClick={() => onViewModeChange('grid')}
              onMouseEnter={() => setHoverState('grid')}
              onMouseLeave={() => setHoverState(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" className="mr-2">
                <path d="M3.88884 9.66294C4.39329 10 5.09552 10 6.49998 10C7.90445 10 8.60668 10 9.11113 9.66294C9.32951 9.51702 9.51701 9.32952 9.66292 9.11114C9.99998 8.60669 9.99998 7.90446 9.99998 6.5C9.99998 5.09554 9.99998 4.39331 9.66292 3.88886C9.51701 3.67048 9.32951 3.48298 9.11113 3.33706C8.60668 3 7.90445 3 6.49998 3C5.09552 3 4.39329 3 3.88884 3.33706C3.67046 3.48298 3.48296 3.67048 3.33705 3.88886C2.99998 4.39331 2.99998 5.09554 2.99998 6.5C2.99998 7.90446 2.99998 8.60669 3.33705 9.11114C3.48296 9.32952 3.67046 9.51702 3.88884 9.66294Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                <path d="M14.8888 9.66294C15.3933 10 16.0955 10 17.5 10C18.9044 10 19.6067 10 20.1111 9.66294C20.3295 9.51702 20.517 9.32952 20.6629 9.11114C21 8.60669 21 7.90446 21 6.5C21 5.09554 21 4.39331 20.6629 3.88886C20.517 3.67048 20.3295 3.48298 20.1111 3.33706C19.6067 3 18.9044 3 17.5 3C16.0955 3 15.3933 3 14.8888 3.33706C14.6705 3.48298 14.483 3.67048 14.337 3.88886C14 4.39331 14 5.09554 14 6.5C14 7.90446 14 8.60669 14.337 9.11114C14.483 9.32952 14.6705 9.51702 14.8888 9.66294Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                <path d="M3.88884 20.6629C4.39329 21 5.09552 21 6.49998 21C7.90445 21 8.60668 21 9.11113 20.6629C9.32951 20.517 9.51701 20.3295 9.66292 20.1111C9.99998 19.6067 9.99998 18.9045 9.99998 17.5C9.99998 16.0955 9.99998 15.3933 9.66292 14.8889C9.51701 14.6705 9.32951 14.483 9.11113 14.3371C8.60668 14 7.90445 14 6.49998 14C5.09552 14 4.39329 14 3.88884 14.3371C3.67046 14.483 3.48296 14.6705 3.33705 14.8889C2.99998 15.3933 2.99998 16.0955 2.99998 17.5C2.99998 18.9045 2.99998 19.6067 3.33705 20.1111C3.48296 20.3295 3.67046 20.517 3.88884 20.6629Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                <path d="M14.8888 20.6629C15.3933 21 16.0955 21 17.5 21C18.9044 21 19.6067 21 20.1111 20.6629C20.3295 20.517 20.517 20.3295 20.6629 20.1111C21 19.6067 21 18.9045 21 17.5C21 16.0955 21 15.3933 20.6629 14.8889C20.517 14.6705 20.3295 14.483 20.1111 14.3371C19.6067 14 18.9044 14 17.5 14C16.0955 14 15.3933 14 14.8888 14.3371C14.6705 14.483 14.483 14.6705 14.337 14.8889C14 15.3933 14 16.0955 14 17.5C14 18.9045 14 19.6067 14.337 20.1111C14.483 20.3295 14.6705 20.517 14.8888 20.6629Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
              </svg>
              <span>Grid</span>
            </button>
            
            <button
              className={`flex items-center justify-center py-3 px-4 rounded-xl text-xs font-medium transition-all duration-300 
                ${viewMode === 'list' 
                  ? 'text-white text-xs' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              style={{
                backgroundColor: viewMode === 'list' ? activeButtonColor : '',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
              }}
              onClick={() => onViewModeChange('list')}
              onMouseEnter={() => setHoverState('list')}
              onMouseLeave={() => setHoverState(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" className="mr-2">
                <path d="M4 4.5L20 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 14.5L20 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 9.5L20 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 19.5L20 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>List</span>
            </button>
          </div>
          
          {/* Filter button */}
          <div className="h-12">
            <Filter 
              activeButtonColor={activeButtonColor}
              hoverColor={buttonHoverColor}
              onApplyFilter={(filterValues) => {
                const { category, price } = filterValues;
                handleFilterChange({ 
                  category,
                  minPrice: price === 'low' ? 0 : price === 'medium' ? 50 : price === 'high' ? 100 : undefined,
                  maxPrice: price === 'low' ? 50 : price === 'medium' ? 100 : price === 'high' ? undefined : undefined
                });
              }} 
            />
          </div>
          
          {/* Sort button - redesigned with shadow and hover effect */}
          <button 
            className="flex items-center justify-center h-12 py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-sm text-xs text-white"
            style={{
              backgroundColor: activeButtonColor,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = buttonHoverColor;
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = activeButtonColor;
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" className="mr-2">
              <path d="M4 4.5L20 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 14.5L20 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 9.5L20 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 19.5L20 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Sort</span>
            <span className="ml-1 text-xs opacity-70">
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </span>
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
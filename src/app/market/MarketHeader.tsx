'use client';

import { useState, useRef, useEffect } from 'react';
import Search from '@/components/header/Search';
import ModernCategoryFilter from './ModernCategoryFilter';
import { useColorContext } from '@/app/context/ColorContext';
import Filter from './Filter';

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

// Custom tooltip component 
const CustomTooltip = ({ 
  content, 
  isVisible 
}: { 
  content: string; 
  isVisible: boolean 
}) => (
  isVisible && (
    <div 
      className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 whitespace-nowrap"
      style={{
        position: 'absolute',
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        color: 'white',
        fontSize: '0.75rem',
        borderRadius: '0.25rem',
        padding: '0.25rem 0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        pointerEvents: 'none',
        zIndex: 99999
      }}
    >
      {content}
    </div>
  )
);

const ModernMarketHeader = ({ 
  viewMode, 
  onViewModeChange,
  filters,
  onFilterChange 
}: MarketHeaderProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [hoverState, setHoverState] = useState<string | null>(null);
  const { accentColor, hexColor } = useColorContext();

  const handleFilterChange = (newFilters: any) => {
    onFilterChange({ ...filters, ...newFilters });
    setIsFilterOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    handleFilterChange({ category });
  };

  // Update pill position and dimensions based on selected view mode
  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [viewMode]);

  const updatePillPosition = () => {
    const index = viewMode === 'grid' ? 0 : 1;
    if (buttonRefs.current[index]) {
      const button = buttonRefs.current[index];
      if (button) {
        setPillStyle({
          left: button.offsetLeft,
          width: button.offsetWidth
        });
      }
    }
  };

  // Get actual hex color without the 'bg-[]' wrapper
  const getHexColor = (bgColor: string) => {
    const match = bgColor.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA';
  };

  const actualHexColor = getHexColor(accentColor);

  return (
    <div 
      className="py-6 mt-8 mb-5 px-6 rounded-2xl transition-colors duration-250 border"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Title and subtitle */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-neutral-800">Marketplace</h1>
            <p className="text-sm text-neutral-500">Discover listings</p>
          </div>
          
          {/* Search component */}
          <div className="flex-1 max-w-xl">
            <Search />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View mode selector */}
          <div className="relative bg-white border rounded-xl hidden sm:flex h-12 overflow-hidden">            
            {/* Moving selection pill */}
            <div 
              className="absolute top-0 bottom-0 rounded-md transition-all duration-200" 
              style={{
                left: `${pillStyle.left}px`, 
                width: `${pillStyle.width}px`,
                backgroundColor: hexColor || '#60A5FA',
                opacity: 0.1
              }}
            />
            
            {/* Grid view button */}
            <div className="relative h-full">
              <button
                ref={el => buttonRefs.current[0] = el}
                className={`h-full px-3 relative z-10 flex items-center justify-center ${viewMode === 'grid' ? 'text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => onViewModeChange('grid')}
                onMouseEnter={() => setHoverState('grid')}
                onMouseLeave={() => setHoverState(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <CustomTooltip content="Grid view" isVisible={hoverState === 'grid'} />
              </button>
            </div>
            
            {/* List view button */}
            <div className="relative h-full">
              <button
                ref={el => buttonRefs.current[1] = el}
                className={`h-full px-3 relative z-10 flex items-center justify-center ${viewMode === 'list' ? 'text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => onViewModeChange('list')}
                onMouseEnter={() => setHoverState('list')}
                onMouseLeave={() => setHoverState(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <CustomTooltip content="List view" isVisible={hoverState === 'list'} />
              </button>
            </div>
          </div>
          
          {/* Sort dropdown */}
          <div className="relative">
            <button 
              className="flex items-center justify-center gap-2 bg-white text-[#71717A] rounded-xl px-4 text-sm transition duration-200 h-12 border"
              onMouseEnter={() => setHoverState('sort')}
              onMouseLeave={() => setHoverState(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
              </svg>
              <span className="font-medium">Sort</span>
              <CustomTooltip content="Sort listings" isVisible={hoverState === 'sort'} />
            </button>
          </div>
          
          {/* Filter component - wrapped to control height */}
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
        </div>
      </div>
      
      {/* Category chips */}
      <div className="mt-5">
        <ModernCategoryFilter 
          selectedCategory={filters.category}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
};

export default ModernMarketHeader;
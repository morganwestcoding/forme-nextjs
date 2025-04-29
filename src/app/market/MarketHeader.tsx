import { useState } from 'react';
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
  onFilterChange: (filters: any) => void;
}

const MarketHeader = ({ 
  viewMode, 
  onViewModeChange,
  filters,
  onFilterChange 
}: MarketHeaderProps) => {
  const [activeFilter, setActiveFilter] = useState(false);
  const [activeSort, setActiveSort] = useState(false);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams?.get('category') || filters.category;

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category
    });
  };

  const handleSortChange = () => {
    const currentSortBy = filters.sortBy || 'date';
    const currentSortOrder = filters.sortOrder || 'desc';
    onFilterChange({
      ...filters,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="w-full">
      {/* Search and Controls Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar - Modern glass morphism style */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-gray-400">
              <path d="M15 15L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"></circle>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search products, shops, categories..." 
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
  
          />
        </div>

        {/* Controls - Flat modern style */}
        <div className="flex items-center gap-3">
          {/* View Toggle - Modern segmented control */}
          <div className="bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center justify-center h-10 w-10 md:w-auto md:px-4 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-gray-400 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              <span className="ml-2 hidden md:inline text-xs font-medium">Grid</span>
            </button>
            
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center justify-center h-10 w-10 md:w-auto md:px-4 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span className="ml-2 hidden md:inline text-xs font-medium">List</span>
            </button>
          </div>
          
          {/* Filter Button - Flat modern style */}
          <button 
            onClick={() => setActiveFilter(!activeFilter)}
            className={`flex items-center justify-center h-12 px-5 rounded-lg transition-all ${
              activeFilter 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">

    <path d="M3 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 17H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M18 17L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15 7L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z" stroke="currentColor" stroke-width="1.5"></path>
            </svg>
            <span className="text-xs font-medium">Filter</span>
          </button>
          
          {/* Sort Button - Flat modern style */}
          <button 
            onClick={() => {
              setActiveSort(!activeSort);
              handleSortChange();
            }}
            className={`flex items-center justify-center h-12 px-5 rounded-lg transition-all ${
              activeSort
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M16 9l-4-4-4 4"></path>
              <path d="M12 5v14"></path>
            </svg>
            <span className="text-xs font-medium">
              Sort
              <span className="ml-1 text-xs">
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            </span>
          </button>
        </div>
      </div>
      
      {/* Categories - Modern chip style 
      <div className="flex flex-wrap gap-2 pb-1">
        <div className="flex overflow-x-auto py-1 scrollbar-hide gap-2 hide-scrollbar w-full">
          {['Default', ...categories.map(cat => cat.label)].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>*/}
    </div>
  );
};

export default MarketHeader;
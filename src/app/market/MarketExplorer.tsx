'use client';

import React from 'react';
import { Grid, List, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import useRentModal from '@/app/hooks/useListingModal';
import useFilterModal from '@/app/hooks/useFilterModal';
import GlobalSearch from '@/components/search/GlobalSearch';

interface ViewState {
  mode: 'grid' | 'list';
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    state?: string;
  };
}

interface MarketExplorerProps {
  searchParams: {
    userId?: string;
    locationValue?: string;
    category?: string;
    state?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    order?: 'asc' | 'desc';
    page?: string;
  };
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
}

const MarketExplorer: React.FC<MarketExplorerProps> = ({
  searchParams,
  viewState,
  setViewState
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const rentModal = useRentModal();
  const filterModal = useFilterModal();

  const currentCategory = searchParams.category || '';

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewState(prev => ({ ...prev, mode }));
  };

  // Toggle: select to set; click again to clear (show all)
  const handleCategorySelect = (categoryLabel: string) => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));

    if (currentCategory === categoryLabel) {
      current.delete('category');
      setViewState(prev => ({ ...prev, filters: { ...prev.filters, category: '' } }));
    } else {
      current.set('category', categoryLabel);
      setViewState(prev => ({ ...prev, filters: { ...prev.filters, category: categoryLabel } }));
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/market${query}`);
  };

  const handleCreateListing = () => {
    rentModal.onOpen();
  };

  const handleOpenFilters = () => {
    filterModal.onOpen();
  };

  // Count active filters for badge
  const getActiveFilterCount = () => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));
    let count = 0;
    
    if (current.get('q')) count++;
    if (current.get('category')) count++;
    if (current.get('type')) count++;
    if (current.get('location')) count++;
    if (current.get('radius') && current.get('radius') !== '25') count++;
    if (current.get('minPrice')) count++;
    if (current.get('maxPrice')) count++;
    if (current.get('openNow')) count++;
    if (current.get('verified')) count++;
    if (current.get('featured')) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="min-h-0">
      {/* Search and Controls */}
      <div className="flex mt-4 mb-6 gap-2">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <GlobalSearch placeholder="Search posts, users, listings, shops, products…" />
        </div>

        {/* View Toggle */}
        <div className="bg-[#EBF4FE] rounded-xl flex items-center shadow-sm p-1 px-2">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewState.mode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
            aria-label="Grid view"
            type="button"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewState.mode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'}`}
            aria-label="List view"
            type="button"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button */}
        <button
          onClick={handleOpenFilters}
          className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm relative"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
            <path d="M14.9999 22H6.40749C5.0778 22 3.99988 20.9221 3.99988 19.5924C3.99988 19.2033 4.09419 18.8199 4.27475 18.4752L9.49988 8.5V2H14.4999V8.5L16.4999 12.3181" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99994 2H15.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99994 11.5H15.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.4999 15L18.242 15.697C17.9038 16.611 17.7347 17.068 17.4013 17.4014C17.068 17.7348 16.611 17.9039 15.697 18.2421L14.9999 18.5L15.697 18.7579C16.611 19.0961 17.068 19.2652 17.4013 19.5986C17.7347 19.932 17.9038 20.389 18.242 21.303L18.4999 22L18.7579 21.303C19.0961 20.389 19.2652 19.932 19.5985 19.5986C19.9319 19.2652 20.3889 19.0961 21.3029 18.7579L21.9999 18.5L21.3029 18.2421C20.3889 17.9039 19.9319 17.7348 19.5985 17.4014C19.2652 17.068 19.0961 16.611 18.7579 15.697L18.4999 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#60A5FA' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Create Button */}
        <button
          onClick={handleCreateListing}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
            <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm">Create</span>
        </button>
      </div>

      {/* Category Navigation - Clean with Vertical Dividers */}
      <div className="py-5 border-y border-gray-200">
        <div className="flex items-center justify-center">
          {categories.map((category, index) => {
            const isSelected = currentCategory === category.label;
            const isLast = index === categories.length - 1;
            
            return (
              <div key={category.label} className="relative flex items-center">
                {/* Category Button */}
                <button
                  onClick={() => handleCategorySelect(category.label)}
                  className={`
                    px-6 py-2.5 text-sm transition-colors duration-200 rounded-lg
                    ${isSelected 
                      ? 'text-[#60A5FA] hover:text-[#4F94E5]' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  type="button"
                >
                  {category.label}
                </button>
                
                {/* Vertical Divider */}
                {!isLast && (
                  <div className="h-6 w-px bg-gray-300 mx-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketExplorer;
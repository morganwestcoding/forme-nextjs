import React from 'react';
import { Search, Grid, List, Filter, Plus, Sparkles, TrendingUp, Layers } from 'lucide-react';
import useRentModal from '@/app/hooks/useRentModal'; // Ensure this hook exists
import RentModal from '@/components/modals/RentModal';

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

  const rentModal = useRentModal(); // Use the rent modal hook
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewState(prev => ({
      ...prev,
      mode
    }));
  };

  const handleFilterChange = (category: string) => {
    setViewState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        category
      }
    }));
  };

  const handleCreateListing = () => {
    rentModal.onOpen(); // Open the rent modal when create button is clicked
  };
  

  return (
    <div className="min-h-0">
      {/* Search and Controls */}
      <div className="flex mt-4 mb-8 gap-2">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search services, locations, categories..." 
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
          />
        </div>

        {/* View Toggle */}
        <div className="bg-[#EBF4FE] rounded-xl flex items-center p-1 px-2">
          <button 
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewState.mode === 'grid' ? 'bg-white text-[#60A5FA]' : 'text-gray-500'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewState.mode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-500'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button */}
        <button className="border bg-white border-neutral-200 
                text-neutral-700 py-3 px-4 rounded-xl 
                hover:bg-neutral-100 transition-colors 
                flex items-center space-x-2  text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
    <path d="M3 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 17H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M18 17L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15 7L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z" stroke="currentColor" stroke-width="1.5"></path>
</svg>
          <span>Filters</span>
        </button>

        {/* Create Button */}
        <button 
                onClick={handleCreateListing}
                className="border bg-white border-neutral-200 
                text-neutral-700 py-3 px-4 rounded-xl 
                hover:bg-neutral-100 transition-colors 
                flex items-center space-x-2 "
              >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
    <path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M18 15.5L13 15.5M15.5 13V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
</svg>
                <span className="text-sm">Create</span>
              </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          onClick={() => handleFilterChange('featured')}
          className={`pb-4 flex text-sm items-center gap-2 mr-6 ${viewState.filters.category === 'featured' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Featured</span>
        </button>
        <button 
          onClick={() => handleFilterChange('trending')}
          className={`pb-4 flex items-center  text-sm gap-2 mr-6 ${viewState.filters.category === 'trending' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Trending</span>
        </button>
        <button 
          onClick={() => handleFilterChange('categories')}
          className={`pb-4 flex items-center  text-sm gap-2 ${viewState.filters.category === 'categories' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <Layers className="w-5 h-5" />
          <span>Categories</span>
        </button>
      </div>
    </div>
  );
};

export default MarketExplorer;

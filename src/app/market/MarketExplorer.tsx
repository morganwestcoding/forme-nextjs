import React from 'react';
import { Search, Grid, List, Filter, Plus, Sparkles, TrendingUp, Layers } from 'lucide-react';
import useRentModal from '@/app/hooks/useRentModal'; // Ensure this hook exists
import RentModal from '@/components/modals/RentModal';
import { FlaskConical, Pencil } from 'lucide-react';

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
        <div className="bg-[#EBF4FE] rounded-xl flex items-center p-1 shadow-sm px-2">
          <button 
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewState.mode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewState.mode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button */}
        <button className="shadow bg-white
                text-gray-500 py-3 px-4 rounded-xl 
                hover:bg-neutral-100 transition-colors 
                flex items-center space-x-2  text-sm">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M8 2L16 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
</svg><span>Filters</span>
        </button>

        {/* Create Button */}
        <button 
                onClick={handleCreateListing}
                className="flex items-center justify-center py-3 space-x-2 px-4 shadow rounded-lg transition-all bg-white text-gray-500 hover:bg-neutral-200"
              >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M12 8V16M16 12H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>  <span className="text-sm">Create</span>
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

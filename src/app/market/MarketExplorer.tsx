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
<FlaskConical className='w-5 h-5'/><span>Filters</span>
        </button>

        {/* Create Button */}
        <button 
                onClick={handleCreateListing}
                className="flex items-center justify-center py-3 space-x-2 px-4 shadow rounded-lg transition-all bg-white text-gray-500 hover:bg-neutral-200"
              >
<Pencil className='w-5 h-5'/>       <span className="text-sm">Create</span>
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

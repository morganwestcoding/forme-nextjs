import React from 'react';
import { Search, Grid, List, Filter, Plus, Sparkles, TrendingUp, Layers } from 'lucide-react';

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
            className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-full"
          />
        </div>

        {/* View Toggle */}
        <div className="bg-green-100 rounded-full flex items-center p-1">
          <button 
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-full ${viewState.mode === 'grid' ? 'bg-white text-green-600' : 'text-gray-500'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-full ${viewState.mode === 'list' ? 'bg-white text-green-600' : 'text-gray-500'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button */}
        <button className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-full">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>

        {/* Create Button */}
        <button className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-full">
          <Plus className="w-5 h-5" />
          <span>Create</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          onClick={() => handleFilterChange('featured')}
          className={`pb-4 flex items-center gap-2 mr-6 ${viewState.filters.category === 'featured' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Featured</span>
        </button>
        <button 
          onClick={() => handleFilterChange('trending')}
          className={`pb-4 flex items-center gap-2 mr-6 ${viewState.filters.category === 'trending' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Trending</span>
        </button>
        <button 
          onClick={() => handleFilterChange('categories')}
          className={`pb-4 flex items-center gap-2 ${viewState.filters.category === 'categories' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
        >
          <Layers className="w-5 h-5" />
          <span>Categories</span>
        </button>
      </div>
    </div>
  );
};

export default MarketExplorer;

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import useShopModal from '@/app/hooks/useShopModal';
import useProductModal from '@/app/hooks/useProductModal';
import { Grid, List, Search, ShoppingBag, Store, Layers, Sparkles, TrendingUp, Plus } from 'lucide-react';

interface ShopHeaderProps {
  currentUser?: SafeUser | null;
  shopId?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  filters?: {
    category: string;
    searchQuery: string;
  };
  onFilterChange?: (filters: any) => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ 
  currentUser,
  shopId,
  viewMode = 'grid',
  onViewModeChange = () => {},
  filters = { category: 'all', searchQuery: '' },
  onFilterChange = () => {}
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery);
  const router = useRouter();
  const shopModal = useShopModal();
  const productModal = useProductModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        searchQuery: searchTerm
      });
    }
  };

  const handleFilterChange = (category: string) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        category
      });
    }
  };

  return (
    <div className="min-h-0">
      {/* Header and Description */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
          <p className="text-gray-600">Discover unique shops and products from our vendors</p>
        </div>
      </div>

      {/* Search and Controls Row */}
      <div className="flex mt-4 mb-8 gap-2">
        {/* Search Bar */}
        <form className="relative flex-grow" onSubmit={handleSearchSubmit}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search shops, products, categories..." 
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button 
            type="submit" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Search</span>
          </button>
        </form>

        {/* View Mode Toggle */}
        <div className="bg-[#EBF4FE] rounded-xl flex items-center p-1 shadow-sm px-2">
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button */}
        <button className="shadow bg-white
              text-neutral-600 py-3 px-4 rounded-xl 
              hover:bg-neutral-100 transition-colors 
              flex items-center space-x-2 text-sm">
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
        
        {/* Create Button with Dropdown */}
        {currentUser && (
          <div>
            <button 
              ref={buttonRef}
              onClick={toggleDropdown}
              className="flex items-center justify-center py-3 space-x-2 px-4 shadow rounded-lg transition-all bg-white text-neutral-600 hover:bg-neutral-200"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Create</span>
            </button>
            
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20"
              >
                <button
                  onClick={() => {
                    shopModal.onOpen();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Create Shop
                </button>
                
                {shopId && (
                  <button
                    onClick={() => {
                      productModal.onOpen(shopId);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Add Product
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          onClick={() => handleFilterChange('featured')}
          className={`pb-4 flex text-sm items-center gap-2 mr-6 ${filters.category === 'featured' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Featured</span>
        </button>
        <button 
          onClick={() => handleFilterChange('trending')}
          className={`pb-4 flex items-center text-sm gap-2 mr-6 ${filters.category === 'trending' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Trending</span>
        </button>
        <button 
          onClick={() => handleFilterChange('products')}
          className={`pb-4 flex text-sm items-center gap-2 mr-6 ${filters.category === 'products' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Products</span>
        </button>
        <button 
          onClick={() => handleFilterChange('shops')}
          className={`pb-4 flex items-center text-sm gap-2 mr-6 ${filters.category === 'shops' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <Store className="w-5 h-5" />
          <span>Shops</span>
        </button>
        <button 
          onClick={() => handleFilterChange('categories')}
          className={`pb-4 flex items-center text-sm gap-2 ${filters.category === 'categories' ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' : 'text-gray-500'}`}
        >
          <Layers className="w-5 h-5" />
          <span>Categories</span>
        </button>
      </div>
    </div>
  );
};

export default ShopHeader;
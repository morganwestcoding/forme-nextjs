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
       <div className="pt-4 mb-4">
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
        
        {/* Create Button with Dropdown */}
        {currentUser && (
          <div>
            <button 
              ref={buttonRef}
              onClick={toggleDropdown}
              className="flex items-center justify-center py-3 space-x-2 px-4 shadow rounded-lg transition-all bg-white text-neutral-600 hover:bg-neutral-200"
            >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
    <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg> <span className="text-sm">Create</span>
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

      {/* Centered Tabs */}
      <div className="flex mb-6 border-b border-gray-200 relative justify-center">
        <div className="flex gap-8">
          <button 
            onClick={() => handleFilterChange('featured')}
            className={`pb-4 pt-2 px-4 flex text-sm items-center justify-center gap-2 transition-all duration-150 relative ${
              filters.category === 'featured' 
                ? 'font-medium text-[#60A5FA]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-transform duration-150 ${
              filters.category === 'featured' ? 'transform -translate-y-px' : ''
            }`} />
            <span className={`transition-transform duration-150 ${
              filters.category === 'featured' ? 'transform -translate-y-px' : ''
            }`}>Featured</span>
            {filters.category === 'featured' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]" />
            )}
          </button>
          
          <button 
            onClick={() => handleFilterChange('trending')}
            className={`pb-4 pt-2 px-4 flex items-center justify-center text-sm gap-2 transition-all duration-150 relative ${
              filters.category === 'trending' 
                ? 'font-medium text-[#60A5FA]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className={`w-5 h-5 transition-transform duration-150 ${
              filters.category === 'trending' ? 'transform -translate-y-px' : ''
            }`} />
            <span className={`transition-transform duration-150 ${
              filters.category === 'trending' ? 'transform -translate-y-px' : ''
            }`}>Trending</span>
            {filters.category === 'trending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]" />
            )}
          </button>
          
          <button 
            onClick={() => handleFilterChange('products')}
            className={`pb-4 pt-2 px-4 flex text-sm items-center justify-center gap-2 transition-all duration-150 relative ${
              filters.category === 'products' 
                ? 'font-medium text-[#60A5FA]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 transition-transform duration-150 ${
              filters.category === 'products' ? 'transform -translate-y-px' : ''
            }`} />
            <span className={`transition-transform duration-150 ${
              filters.category === 'products' ? 'transform -translate-y-px' : ''
            }`}>Products</span>
            {filters.category === 'products' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]" />
            )}
          </button>
          
          <button 
            onClick={() => handleFilterChange('shops')}
            className={`pb-4 pt-2 px-4 flex items-center justify-center text-sm gap-2 transition-all duration-150 relative ${
              filters.category === 'shops' 
                ? 'font-medium text-[#60A5FA]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className={`w-5 h-5 transition-transform duration-150 ${
              filters.category === 'shops' ? 'transform -translate-y-px' : ''
            }`} />
            <span className={`transition-transform duration-150 ${
              filters.category === 'shops' ? 'transform -translate-y-px' : ''
            }`}>Shops</span>
            {filters.category === 'shops' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]" />
            )}
          </button>
          
          <button 
            onClick={() => handleFilterChange('categories')}
            className={`pb-4 pt-2 px-4 flex items-center justify-center text-sm gap-2 transition-all duration-150 relative ${
              filters.category === 'categories' 
                ? 'font-medium text-[#60A5FA]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className={`w-5 h-5 transition-transform duration-150 ${
              filters.category === 'categories' ? 'transform -translate-y-px' : ''
            }`} />
            <span className={`transition-transform duration-150 ${
              filters.category === 'categories' ? 'transform -translate-y-px' : ''
            }`}>Categories</span>
            {filters.category === 'categories' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
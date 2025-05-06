'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import useShopModal from '@/app/hooks/useShopModal';
import useProductModal from '@/app/hooks/useProductModal';

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
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const shopModal = useShopModal();
  const productModal = useProductModal();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        searchQuery: e.target.value
      });
    }
  };

  return (
    <div className="w-full">
         <div className="mb-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
            <p className="text-gray-600">Discover unique services from our vendors</p>
          </div>
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
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search products, shops, categories..." 
            className="w-full h-12 pl-12 pr-4 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Controls - Flat modern style */}
        <div className="flex items-center gap-3">
          {/* View Toggle - Modern segmented control */}
          <div className="bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center shadow-sm justify-center h-10 w-10 md:w-auto md:px-4 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-slate-400 text-white shadow-sm' 
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
          
          {/* Create Button with Dropdown - Styled like other buttons */}
          {currentUser && (
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center justify-center h-12 px-5 shadow-sm rounded-lg transition-all bg-blue-600 text-white hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium">Create</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
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
          
          {/* Dashboard Button */}
          {currentUser && (
            <Link 
              href="/shop/dashboard" 
              className="flex items-center justify-center h-12 px-5 shadow-sm rounded-lg transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
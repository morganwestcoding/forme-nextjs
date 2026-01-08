'use client';

import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FilterProps {
  activeButtonColor: string;
  hoverColor: string;
  onApplyFilter: (filters: {
    category?: string;
    price?: 'low' | 'medium' | 'high';
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) => void;
}

const Filter: React.FC<FilterProps> = ({ activeButtonColor, hoverColor, onApplyFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<{
    category: string;
    price: 'low' | 'medium' | 'high' | '';
    sortBy: 'price' | 'date' | 'name' | '';
    sortOrder: 'asc' | 'desc';
  }>({
    category: '',
    price: '',
    sortBy: '',
    sortOrder: 'desc',
  });

  const handleChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Convert empty string price to undefined to match the expected types
    const filterData = {
      ...filters,
      price: filters.price === '' ? undefined : filters.price,
      sortBy: filters.sortBy === '' ? undefined : filters.sortBy
    };
    
    onApplyFilter(filterData);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center justify-center h-12 py-3 px-4 rounded-xl text-xs font-medium transition-all duration-300 shadow-sm text-white"
          style={{
            backgroundColor: activeButtonColor,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = hoverColor;
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = activeButtonColor;
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" className="mr-2">
            <path d="M3 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M3 17H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18 17L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 7L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z" stroke="currentColor" stroke-width="1.5"></path>
            <path d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z" stroke="currentColor" stroke-width="1.5"></path>
          </svg>
          <span>Filter</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 p-5 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        {/* Price Range Filter */}
        <div className="mb-5">
          <h4 className="font-medium mb-3 text-sm">Price Range</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="price-low"
                name="price"
                checked={filters.price === 'low'}
                onChange={() => handleChange('price', 'low')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="price-low" className="text-sm">$0 - $50</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="price-medium"
                name="price"
                checked={filters.price === 'medium'}
                onChange={() => handleChange('price', 'medium')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="price-medium" className="text-sm">$50 - $100</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="price-high"
                name="price"
                checked={filters.price === 'high'}
                onChange={() => handleChange('price', 'high')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="price-high" className="text-sm">$100+</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="price-all"
                name="price"
                checked={filters.price === ''}
                onChange={() => handleChange('price', '')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="price-all" className="text-sm">All Prices</label>
            </div>
          </div>
        </div>
        
        {/* Sort By Filter */}
        <div className="mb-5">
          <h4 className="font-medium mb-3 text-sm">Sort By</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-date"
                name="sortBy"
                checked={filters.sortBy === 'date'}
                onChange={() => handleChange('sortBy', 'date')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="sort-date" className="text-sm">Date</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-price"
                name="sortBy"
                checked={filters.sortBy === 'price'}
                onChange={() => handleChange('sortBy', 'price')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="sort-price" className="text-sm">Price</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-name"
                name="sortBy"
                checked={filters.sortBy === 'name'}
                onChange={() => handleChange('sortBy', 'name')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="sort-name" className="text-sm">Name</label>
            </div>
          </div>
        </div>
        
        {/* Sort Order */}
        <div className="mb-5">
          <h4 className="font-medium mb-3 text-sm">Sort Order</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="order-asc"
                name="sortOrder"
                checked={filters.sortOrder === 'asc'}
                onChange={() => handleChange('sortOrder', 'asc')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="order-asc" className="text-sm flex items-center">
                <span>Ascending</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="order-desc"
                name="sortOrder"
                checked={filters.sortOrder === 'desc'}
                onChange={() => handleChange('sortOrder', 'desc')}
                className="mr-3 h-4 w-4 accent-[#60A5FA]"
                style={{ accentColor: activeButtonColor }}
              />
              <label htmlFor="order-desc" className="text-sm flex items-center">
                <span>Descending</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </label>
            </div>
          </div>
        </div>
        
        {/* Apply and Reset buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setFilters({
                category: '',
                price: '',
                sortBy: '',
                sortOrder: 'desc',
              });
            }}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Reset
          </button>
          
          <button
            onClick={handleApply}
            className="flex-1 py-3 text-white rounded-xl transition-colors font-medium text-sm"
            style={{
              backgroundColor: activeButtonColor
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = hoverColor;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = activeButtonColor;
            }}
          >
            Apply
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;
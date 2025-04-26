'use client';

import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// If you don't have a UI library with these components, 
// you might need to implement a custom dropdown

interface FilterProps {
  onApplyFilter: (filters: {
    category?: string;
    price?: 'low' | 'medium' | 'high';
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) => void;
}

const Filter: React.FC<FilterProps> = ({ onApplyFilter }) => {
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
        <button className="flex items-center justify-center h-12 py-3 px-4 w-24 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-100 bg-gray-100 hover:bg-gray-50 text-neutral-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filter</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-4">
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        
        {/* Price Range Filter */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-sm">Price Range</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="price-low"
                name="price"
                checked={filters.price === 'low'}
                onChange={() => handleChange('price', 'low')}
                className="mr-2"
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
                className="mr-2"
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
                className="mr-2"
              />
              <label htmlFor="price-high" className="text-sm">$100+</label>
            </div>
          </div>
        </div>
        
        {/* Sort By Filter */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-sm">Sort By</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-date"
                name="sortBy"
                checked={filters.sortBy === 'date'}
                onChange={() => handleChange('sortBy', 'date')}
                className="mr-2"
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
                className="mr-2"
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
                className="mr-2"
              />
              <label htmlFor="sort-name" className="text-sm">Name</label>
            </div>
          </div>
        </div>
        
        {/* Sort Order */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-sm">Sort Order</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="order-asc"
                name="sortOrder"
                checked={filters.sortOrder === 'asc'}
                onChange={() => handleChange('sortOrder', 'asc')}
                className="mr-2"
              />
              <label htmlFor="order-asc" className="text-sm">Ascending</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="order-desc"
                name="sortOrder"
                checked={filters.sortOrder === 'desc'}
                onChange={() => handleChange('sortOrder', 'desc')}
                className="mr-2"
              />
              <label htmlFor="order-desc" className="text-sm">Descending</label>
            </div>
          </div>
        </div>
        
        {/* Apply button */}
        <button
          onClick={handleApply}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;
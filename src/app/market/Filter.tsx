'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useColorContext } from '@/app/context/ColorContext';

// Define the types directly in this file
interface FilterOption {
  label: string;
  value: string;
}

export interface FilterValues {
  category: string;
  location: string;
  price: string;
  [key: string]: string; // Allow for additional filter types
}

interface FilterProps {
  onApplyFilter?: (filters: FilterValues) => void;
}

const Filter: React.FC<FilterProps> = ({ onApplyFilter }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const { hexColor } = useColorContext();
  
  // Filter categories (customize these based on your needs)
  const categoryOptions: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Barber', value: 'barber' },
    { label: 'Beauty', value: 'beauty' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Spa', value: 'spa' },
    { label: 'Massage', value: 'massage' }
  ];

  // Location filter options
  const locationOptions: FilterOption[] = [
    { label: 'All Locations', value: 'all' },
    { label: 'Nearby', value: 'nearby' },
    { label: 'Trending', value: 'trending' }
  ];

  // Price filter options
  const priceOptions: FilterOption[] = [
    { label: '$', value: 'low' },
    { label: '$$', value: 'medium' },
    { label: '$$$', value: 'high' }
  ];

  // Get current filter values from URL
  const [filters, setFilters] = useState<FilterValues>({
    category: searchParams?.get('category') || 'all',
    location: searchParams?.get('location') || 'all',
    price: searchParams?.get('price') || ''
  });

  // Handle clicks outside the filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    // Get current query parameters
    let currentQuery = {};
    if (searchParams) {
      currentQuery = qs.parse(searchParams.toString());
    }
    
    // Prepare updated query
    const updatedQuery: any = {
      ...currentQuery
    };
    
    // Only add filters that are not set to default values
    if (filters.category && filters.category !== 'all') {
      updatedQuery.category = filters.category;
    } else {
      delete updatedQuery.category;
    }
    
    if (filters.location && filters.location !== 'all') {
      updatedQuery.location = filters.location;
    } else {
      delete updatedQuery.location;
    }
    
    if (filters.price) {
      updatedQuery.price = filters.price;
    } else {
      delete updatedQuery.price;
    }
    
    // Build the URL
    const url = qs.stringifyUrl({
      url: '/market',
      query: updatedQuery
    }, { skipNull: true });
    
    // Update URL and close filter
    router.push(url);
    setIsOpen(false);
    
    // Call callback if provided
    if (onApplyFilter) {
      onApplyFilter(filters);
    }
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      location: 'all',
      price: ''
    });
  };

  // Calculate how many filters are active
  const activeFilterCount = Object.values(filters).filter(val => val && val !== 'all').length;

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Button */}
      <button
        onClick={toggleFilter}
        className="flex items-center justify-center gap-2 bg-gray-100 text-neutral-700 rounded-xl px-6 text-sm h-12 transition duration-200 w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span className="font-medium">Filter</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-white text-neutral-800 rounded-full text-xs font-semibold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-neutral-800">Filters</h3>
              <button 
                onClick={resetFilters}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-800 mb-2">Category</h4>
              <div className="grid grid-cols-3 gap-2">
                {categoryOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('category', option.value)}
                    className={`
                      px-3 py-2 text-sm rounded-md transition duration-200
                      ${filters.category === option.value 
                        ? `bg-[${hexColor || '#60A5FA'}] text-white` 
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
                    `}
                    style={filters.category === option.value ? { backgroundColor: hexColor || '#60A5FA' } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-800 mb-2">Location</h4>
              <div className="flex flex-wrap gap-2">
                {locationOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('location', option.value)}
                    className={`
                      px-3 py-2 text-sm rounded-md transition duration-200
                      ${filters.location === option.value 
                        ? `bg-[${hexColor || '#60A5FA'}] text-white` 
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
                    `}
                    style={filters.location === option.value ? { backgroundColor: hexColor || '#60A5FA' } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-800 mb-2">Price</h4>
              <div className="flex gap-2">
                {priceOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('price', option.value)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-md transition duration-200 flex-1
                      ${filters.price === option.value 
                        ? `bg-[${hexColor || '#60A5FA'}] text-white` 
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
                    `}
                    style={filters.price === option.value ? { backgroundColor: hexColor || '#60A5FA' } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="w-full py-3 rounded-md font-medium transition duration-200 text-white"
              style={{ backgroundColor: hexColor || '#60A5FA' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
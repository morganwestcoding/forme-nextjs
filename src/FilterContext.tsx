// contexts/FilterContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterState {
  location: {
    state?: string;
    city?: string;
  };
  price: {
    min?: number;
    max?: number;
  };
  sort: {
    order?: 'asc' | 'desc';
    by?: 'date' | 'price';
  };
}

interface FilterContextType {
  filters: FilterState;
  setLocationFilter: (state?: string, city?: string) => void;
  setPriceFilter: (min?: number, max?: number) => void;
  setSortFilter: (order?: 'asc' | 'desc', by?: 'date' | 'price') => void;
  clearLocationFilter: () => void;
  clearPriceFilter: () => void;
  clearSortFilter: () => void;
  clearAllFilters: () => void;
}

const initialFilters: FilterState = {
  location: {
    state: undefined,
    city: undefined
  },
  price: {
    min: undefined,
    max: undefined
  },
  sort: {
    order: undefined,
    by: undefined
  }
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('filters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters({
          location: parsedFilters.location || initialFilters.location,
          price: parsedFilters.price || initialFilters.price,
          sort: parsedFilters.sort || initialFilters.sort
        });
        updateURL({
          location: parsedFilters.location || initialFilters.location,
          price: parsedFilters.price || initialFilters.price,
          sort: parsedFilters.sort || initialFilters.sort
        });
      }
    } catch (error) {
      console.error('Error loading filters:', error);
      setFilters(initialFilters);
    }
  }, []);

  // Update URL based on filters
  const updateURL = (currentFilters: FilterState) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    // Location params
    const locationState = currentFilters.location?.state;
    const locationCity = currentFilters.location?.city;
    
    if (locationState) {
      params.set('state', locationState);
    } else {
      params.delete('state');
    }
    
    if (locationCity) {
      params.set('city', locationCity);
    } else {
      params.delete('city');
    }

    // Price params
    const priceMin = currentFilters.price?.min;
    const priceMax = currentFilters.price?.max;
    
    if (priceMin !== undefined) {
      params.set('minPrice', priceMin.toString());
    } else {
      params.delete('minPrice');
    }
    
    if (priceMax !== undefined) {
      params.set('maxPrice', priceMax.toString());
    } else {
      params.delete('maxPrice');
    }

    // Sort params
    const sortOrder = currentFilters.sort?.order;
    const sortBy = currentFilters.sort?.by;
    
    if (sortOrder) {
      params.set('order', sortOrder);
    } else {
      params.delete('order');
    }
    
    if (sortBy) {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }

    router.push(`${pathname}?${params.toString()}`);
    localStorage.setItem('filters', JSON.stringify(currentFilters));
  };

  const setLocationFilter = (state?: string, city?: string) => {
    const newFilters = {
      ...filters,
      location: { ...filters.location, state, city }
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const setPriceFilter = (min?: number, max?: number) => {
    const newFilters = {
      ...filters,
      price: { ...filters.price, min, max }
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const setSortFilter = (order?: 'asc' | 'desc', by?: 'date' | 'price') => {
    const newFilters = {
      ...filters,
      sort: { ...filters.sort, order, by }
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearLocationFilter = () => {
    const newFilters = {
      ...filters,
      location: initialFilters.location
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearPriceFilter = () => {
    const newFilters = {
      ...filters,
      price: initialFilters.price
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearSortFilter = () => {
    const newFilters = {
      ...filters,
      sort: initialFilters.sort
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    updateURL(initialFilters);
  };

  return (
    <FilterContext.Provider 
      value={{ 
        filters,
        setLocationFilter,
        setPriceFilter,
        setSortFilter,
        clearLocationFilter,
        clearPriceFilter,
        clearSortFilter,
        clearAllFilters
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
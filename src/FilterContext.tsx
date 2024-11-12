// contexts/FilterContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterContextType {
  state: string | undefined;
  city: string | undefined;
  priceRange: number | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
  setState: (state: string | undefined) => void;
  setCity: (city: string | undefined) => void;
  setPriceRange: (price: number | undefined) => void;
  setSortOrder: (order: 'asc' | 'desc' | undefined) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load filters from localStorage on initial mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setState(filters.state);
      setCity(filters.city);
      setPriceRange(filters.priceRange);
      setSortOrder(filters.sortOrder);

      // Update URL with saved filters
      const currentParams = new URLSearchParams(window.location.search);
      if (filters.state) currentParams.set('state', filters.state);
      if (filters.city) currentParams.set('city', filters.city);
      if (filters.priceRange) currentParams.set('price', filters.priceRange.toString());
      if (filters.sortOrder) currentParams.set('sort', filters.sortOrder);
      
      const newUrl = `${pathname}?${currentParams.toString()}`;
      router.push(newUrl);
    }
  }, []);

  // Update localStorage and URL when filters change
  useEffect(() => {
    const filters = { state, city, priceRange, sortOrder };
    localStorage.setItem('filters', JSON.stringify(filters));

    const currentParams = new URLSearchParams(window.location.search);
    
    if (state) currentParams.set('state', state);
    else currentParams.delete('state');
    
    if (city) currentParams.set('city', city);
    else currentParams.delete('city');
    
    if (priceRange) currentParams.set('price', priceRange.toString());
    else currentParams.delete('price');
    
    if (sortOrder) currentParams.set('sort', sortOrder);
    else currentParams.delete('sort');

    const newUrl = `${pathname}?${currentParams.toString()}`;
    router.push(newUrl);
  }, [state, city, priceRange, sortOrder, pathname]);

  return (
    <FilterContext.Provider 
      value={{ 
        state, 
        city, 
        priceRange, 
        sortOrder,
        setState,
        setCity,
        setPriceRange,
        setSortOrder
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
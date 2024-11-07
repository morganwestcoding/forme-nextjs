'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface CategoryContextType {
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load category from localStorage on initial mount
  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
      // Update URL with saved category
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('category', savedCategory);
      const newUrl = `${pathname}?${currentParams.toString()}`;
      router.push(newUrl);
    }
  }, []); // Empty dependency array for initial load only

  // Update URL and localStorage when category changes
  const handleSetCategory = (category: string | undefined) => {
    setSelectedCategory(category);
    
    // Save to localStorage
    if (category) {
      localStorage.setItem('selectedCategory', category);
    } else {
      localStorage.removeItem('selectedCategory');
    }

    // Update URL
    const currentParams = new URLSearchParams(window.location.search);
    if (category) {
      currentParams.set('category', category);
    } else {
      currentParams.delete('category');
    }
    const newUrl = `${pathname}?${currentParams.toString()}`;
    router.push(newUrl);
  };

  // Listen for URL changes and update category if needed
  useEffect(() => {
    const categoryFromUrl = searchParams?.get('category');
    const savedCategory = localStorage.getItem('selectedCategory');

    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      localStorage.setItem('selectedCategory', categoryFromUrl);
    } else if (!categoryFromUrl && savedCategory) {
      // If there's no category in URL but there is one saved, update URL
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('category', savedCategory);
      const newUrl = `${pathname}?${currentParams.toString()}`;
      router.push(newUrl);
    }
  }, [pathname, searchParams]); // Listen for route changes

  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory: handleSetCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
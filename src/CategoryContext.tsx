'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryContextType {
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const category = searchParams?.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const handleSetCategory = (category: string | undefined) => {
    setSelectedCategory(category);
    const currentParams = new URLSearchParams(window.location.search);
    if (category) {
      currentParams.set('category', category);
    } else {
      currentParams.delete('category');
    }
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    router.push(newUrl);
  };

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
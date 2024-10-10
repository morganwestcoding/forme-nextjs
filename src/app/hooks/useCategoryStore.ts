import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CategoryState {
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}

export const useCategoryStore = create(
  persist<CategoryState>(
    (set) => ({
      selectedCategory: undefined,
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: 'category-storage',
    }
  )
);
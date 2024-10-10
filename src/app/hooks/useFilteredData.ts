// hooks/useFilteredData.ts
import { useEffect, useState } from 'react';
import { useCategoryStore } from './useCategoryStore';

export function useFilteredData<T>(fetchFunction: (category?: string) => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const { selectedCategory } = useCategoryStore();

  useEffect(() => {
    fetchFunction(selectedCategory).then(setData);
  }, [selectedCategory, fetchFunction]);

  return data;
}
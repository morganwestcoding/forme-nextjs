// components/MarketWrapper.tsx
'use client';

import { useCategory } from '@/CategoryContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function MarketWrapper({ children }: { children: React.ReactNode }) {
  const { selectedCategory } = useCategory();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (selectedCategory && searchParams) {
      const current = new URLSearchParams(
        searchParams ? Array.from(searchParams.entries()) : []
      );
      
      current.set('category', selectedCategory);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`/market${query}`);
    }
  }, [selectedCategory, router, searchParams]);

  return <>{children}</>;
}
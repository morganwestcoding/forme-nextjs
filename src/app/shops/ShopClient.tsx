// components/shop/ShopClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';

import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import EmptyState from '@/components/EmptyState';

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const MIN_LOADER_MS = 1800;
const CONTAINER_FADE_MS = 700;

const ShopClient: React.FC<ShopClientProps> = ({ 
  initialShops = [],
  featuredProducts = [],
  categories = [],
  currentUser
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: 'featured', searchQuery: '' });
  const [isLoading, setIsLoading] = useState(true);

  const filteredShops = useMemo(() => {
    if (!filters.searchQuery) return initialShops;
    const q = filters.searchQuery.toLowerCase();
    return initialShops.filter(s =>
      s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [initialShops, filters.searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!filters.searchQuery) return featuredProducts;
    const q = filters.searchQuery.toLowerCase();
    return featuredProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [featuredProducts, filters.searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [initialShops, featuredProducts]);

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-6">
        <ShopHeader 
          currentUser={currentUser}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={(next) => {
            setIsLoading(true);
            setFilters(next);
            setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
          }}
        />
      </div>

      <div className="relative">
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
            <div className="mt-40 md:mt-40">
              <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
            </div>
          </div>
        )}

        <div
          className={`transition-opacity ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: `${CONTAINER_FADE_MS}ms` }}
        >
          {/* Shops */}
          {filteredShops.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} data={shop} currentUser={currentUser} />
              ))}
            </div>
          ) : (
            <EmptyState title="No shops found" subtitle="Try adjusting your filters or search" />
          )}

          {/* Products (stacked list) */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} data={product} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopClient;

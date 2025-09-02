// components/shop/ShopClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';

import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import EmptyState from '@/components/EmptyState';

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const ShopClient: React.FC<ShopClientProps> = ({
  initialShops = [],
  featuredProducts = [],
  categories = [],
  currentUser,
}) => {
  // minimal state so Search in ShopHeader can work
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: 'featured', searchQuery: '' });

  const q = filters.searchQuery.trim().toLowerCase();

  const shops = useMemo(() => {
    if (!q) return initialShops;
    return initialShops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
    );
  }, [initialShops, q]);

  const products = useMemo(() => {
    if (!q) return featuredProducts;
    return featuredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [featuredProducts, q]);

  const hasShops = shops.length > 0;
  const hasProducts = products.length > 0;

  return (
    <div className="flex-1">
      {/* Page heading + controls */}
      <div className="pb-6">

        <ShopHeader
          currentUser={currentUser}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Simple 3-col grid at md+: left spans 2 (shops), right spans 1 (stacked products) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* LEFT: shops (take up two columns) */}
        <div className={hasProducts ? 'md:col-span-2' : 'md:col-span-3'}>
          {hasShops ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} data={shop} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} data={shop} currentUser={currentUser} />
                ))}
              </div>
            )
          ) : (
            <EmptyState title="No shops found" subtitle="Try adjusting your search" />
          )}
        </div>

        {/* RIGHT: products stacked (exact width of one shop column) */}
        {hasProducts && (
          <div className="md:col-span-1 space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} data={product} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopClient;

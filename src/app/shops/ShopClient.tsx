// components/shop/ShopClient.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import SectionHeader from '@/app/market/SectionHeader';

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const MIN_LOADER_MS = 1200;

const ShopClient: React.FC<ShopClientProps> = ({
  initialShops = [],
  featuredProducts = [],
  categories = [],
  currentUser,
}) => {
  const router = useRouter();
  
  // View state matching other components
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: 'Featured', searchQuery: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Loader (nice UX delay)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [initialShops]);

  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    const currentCategory = filters.category || 'Featured';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'Featured' && currentCategory !== 'All';

    // Check for search filters
    const hasSearchFilter = !!filters.searchQuery?.trim();

    const isFiltered = categoryIsActive || hasSearchFilter;

    // Determine results header text
    let resultsHeaderText = '';
    if (categoryIsActive && currentCategory) {
      resultsHeaderText = `${currentCategory} Results`;
    } else if (hasSearchFilter) {
      resultsHeaderText = 'Search Results';
    }

    return {
      isFiltered,
      categoryIsActive,
      resultsHeaderText,
      currentCategory
    };
  }, [filters]);

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
  const hasContent = hasShops || hasProducts;

  // Scroll functions for section headers (placeholder implementation)
  const scrollFeaturedShops = (dir: 'left' | 'right') => {
    console.log('Scroll featured shops', dir);
  };

  const scrollFeaturedProducts = (dir: 'left' | 'right') => {
    console.log('Scroll featured products', dir);
  };

  return (
    <>
      {/* Main Vendors Title - Always Visible */}
      <div className="pt-2 mb-4">
        <div>
  <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">Vendors</h1>
          <p className="text-gray-600">Discover unique shops and products from our vendors</p>
        </div>
      </div>

      {/* Search and Category Controls */}
      <ShopHeader
        currentUser={currentUser}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Content + loader overlay */}
      <div className="relative">
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
            <div className="mt-40 md:mt-40">
              <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
            </div>
          </div>
        )}

        <div
          className={`transition-opacity duration-700 ease-out ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {viewMode === 'grid' ? (
            hasContent ? (
              <>
                {/* ===== Featured Shops Section ===== */}
                {!filterInfo.isFiltered && hasShops && (
                  <SectionHeader
                    title="Featured Shops"
                    onPrev={() => scrollFeaturedShops('left')}
                    onNext={() => scrollFeaturedShops('right')}
                    onViewAll={() => setFilters(prev => ({ ...prev, category: 'Shops' }))}
                  />
                )}

                {/* ===== Results Section Header (when filtered) ===== */}
                {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                  <SectionHeader
                    title={filterInfo.resultsHeaderText}
                    // No navigation controls for results section
                  />
                )}

                {/* Shops Grid (4 visible when not filtered, all when filtered) */}
                {hasShops && (
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {(filterInfo.isFiltered ? shops : shops.slice(0, 4)).map((shop, idx) => (
                      <div
                        key={shop.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${140 + idx * 30}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ShopCard data={shop} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== Featured Products Section ===== */}
                {!filterInfo.isFiltered && hasProducts && (
                  <>
                    <SectionHeader
                      title="Featured Products"
                      onPrev={() => scrollFeaturedProducts('left')}
                      onNext={() => scrollFeaturedProducts('right')}
                      onViewAll={() => setFilters(prev => ({ ...prev, category: 'Products' }))}
                    />

                    <div className="grid grid-cols-4 gap-4">
                      {products.slice(0, 4).map((product, idx) => (
                        <div
                          key={product.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
                            animationDelay: `${160 + idx * 30}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ProductCard data={product} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Products Grid (when filtered) */}
                {filterInfo.isFiltered && hasProducts && (
                  <div className="grid grid-cols-4 gap-4">
                    {products.map((product, idx) => (
                      <div
                        key={product.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${160 + idx * 30}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ProductCard data={product} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                No shops or products found. Try adjusting your search.
              </div>
            )
          ) : (
            // List view - could be implemented later
            <div className="space-y-4">
              {hasShops && shops.map((shop) => (
                <ShopCard key={shop.id} data={shop} currentUser={currentUser} />
              ))}
              {hasProducts && products.map((product) => (
                <ProductCard key={product.id} data={product} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopClient;
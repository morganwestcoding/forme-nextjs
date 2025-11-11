// components/shop/ShopClient.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import CategoryNav from '@/components/shop/CategoryNav';
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
  currentUser,
}) => {
  const params = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  // Get category and search from URL params
  const currentCategory = params?.get('category') || '';
  const searchQuery = params?.get('q') || '';

  // Loader (nice UX delay)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [initialShops]);

  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'Featured' && currentCategory !== 'All';

    // Check for search filters
    const hasSearchFilter = !!searchQuery?.trim();

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
  }, [currentCategory, searchQuery]);

  const q = searchQuery.trim().toLowerCase();

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
      {/* Hero Section - Full Width with Subtle Gradient & Shadow Layers */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-10 pb-8 overflow-hidden">
          {/* Subtle shadow layers for depth with animation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top soft shadow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            {/* Soft inner glow from top */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/60 to-transparent"></div>

            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/[0.03] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Main Vendors Title */}
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Vendors
              </h1>
              <p className="text-gray-600 mt-3">Discover unique shops and products from our vendors</p>
            </div>

            {/* Search and Controls */}
            <ShopHeader currentUser={currentUser} isHeroMode={false} />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <CategoryNav searchParams={{ category: currentCategory }} />

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
          {hasContent ? (
            <>
              {/* ===== Featured Shops Section ===== */}
              {!filterInfo.isFiltered && hasShops && (
                <SectionHeader
                  title="Featured Shops"
                  onPrev={() => scrollFeaturedShops('left')}
                  onNext={() => scrollFeaturedShops('right')}
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
            <div className="px-8 pt-32 text-center text-gray-500">
              No shops or products found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopClient;
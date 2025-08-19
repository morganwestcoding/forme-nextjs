// components/shop/ShopClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const MIN_LOADER_MS = 1800;          // same as MarketContent
const FADE_DURATION_MS = 520;        // same
const FADE_STAGGER_BASE_MS = 140;    // same
const FADE_STAGGER_STEP_MS = 30;     // same
const CONTAINER_FADE_MS = 700;

/** Deterministic interleave to avoid SSR/CSR mismatch */
function interleaveDeterministic<A, B>(a: A[], b: B[]) {
  const out: (A | B)[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

type Card =
  | { type: 'shop'; id: string; element: JSX.Element }
  | { type: 'product'; id: string; element: JSX.Element };

const ShopClient: React.FC<ShopClientProps> = ({ 
  initialShops = [],
  featuredProducts = [],
  categories = [],
  currentUser
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: 'featured', searchQuery: '' });
  const [isLoading, setIsLoading] = useState(true);

  const filteredProducts = useMemo(() => {
    if (!filters.searchQuery) return featuredProducts;
    const q = filters.searchQuery.toLowerCase();
    return featuredProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [featuredProducts, filters.searchQuery]);

  const filteredShops = useMemo(() => {
    if (!filters.searchQuery) return initialShops;
    const q = filters.searchQuery.toLowerCase();
    return initialShops.filter(s =>
      s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [initialShops, filters.searchQuery]);

  const combinedCards: Card[] = useMemo(() => {
    const shopCards: Card[] = filteredShops.map((shop) => ({
      type: 'shop' as const,
      id: shop.id,
      element: <ShopCard data={shop} currentUser={currentUser} />
    }));
    const productCards: Card[] = filteredProducts.slice(0, 8).map((product) => ({
      type: 'product' as const,
      id: product.id,
      element: <ProductCard data={product} currentUser={currentUser} />
    }));
    return interleaveDeterministic(shopCards, productCards);
  }, [filteredShops, filteredProducts, currentUser]);

  // Build animated wrappers ONLY when loader completes
  const [animatedCards, setAnimatedCards] = useState<JSX.Element[]>([]);

  const buildAnimatedCards = () =>
    combinedCards.map((card, idx) => {
      const delay = FADE_STAGGER_BASE_MS + (idx % 12) * FADE_STAGGER_STEP_MS; // identical to MarketContent
      return (
        <div
          key={`${card.type}-${card.id}`}
          style={{
            opacity: 0,
            animation: `fadeInUp ${FADE_DURATION_MS}ms ease-out forwards`,
            animationDelay: `${delay}ms`,
            willChange: 'transform, opacity',
          }}
        >
          {card.element}
        </div>
      );
    });

  // Initial loader timing
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [initialShops, featuredProducts]);

  // When loading flips to false, (re)build animated cards so animations start now
  useEffect(() => {
    if (!isLoading) {
      setAnimatedCards(buildAnimatedCards());
    }
  }, [isLoading, combinedCards]);

  return (
    <div className="flex-1">
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

        {/* Container fades in under the loader */}
        <div
          className={`transition-opacity ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: `${CONTAINER_FADE_MS}ms` }}
        >
          {combinedCards.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {animatedCards}
            </div>
          ) : (
            <EmptyState
              title="No shops or products found"
              subtitle="Try adjusting your filters or search"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopClient;

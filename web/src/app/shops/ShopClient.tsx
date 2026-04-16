'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import PageSearch from '@/components/search/PageSearch';
import CategoryNav from '@/app/market/CategoryNav';
import SectionHeader from '@/app/market/SectionHeader';
import PageHeader from '@/components/PageHeader';
import { categories } from '@/components/Categories';
import { useSidebarState } from '@/app/hooks/useSidebarState';
import useLocationModal from '@/app/hooks/useLocationModal';

// Shuffle array using Fisher-Yates algorithm (seeded for stability during session)
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const FADE_OUT_DURATION = 200;

const BANNERS = [
  {
    src: '/assets/people/banner-7.png',
    alt: 'Most Popular',
    tag: 'Trending',
    title: 'Most Popular',
    subtitle: 'What everyone is booking',
    href: '/shops?category=Barber',
  },
  {
    src: '/assets/people/banner-6.png',
    alt: 'New on ForMe',
    tag: 'Curated',
    title: 'New on ForMe',
    subtitle: 'Fresh brands joining our community',
    href: '/shops?category=Wellness',
  },
  {
    src: '/assets/people/banner-5.png',
    alt: 'Near You',
    tag: 'Local',
    title: 'Near You',
    subtitle: 'Top-rated in your area',
    href: '/maps',
  },
];



const ShopClient: React.FC<ShopClientProps> = ({
  initialShops: serverShops = [],
  featuredProducts: serverProducts = [],
  currentUser,
}) => {
  const params = useSearchParams();
  const router = useRouter();
  const isSidebarCollapsed = useSidebarState();

  // Client-side fetch when no server data
  const [fetchedShops, setFetchedShops] = useState<SafeShop[] | null>(serverShops.length ? serverShops : null);
  const [fetchedProducts, setFetchedProducts] = useState<SafeProduct[] | null>(serverProducts.length ? serverProducts : null);
  const isLoadingData = fetchedShops === null;

  useEffect(() => {
    if (serverShops.length > 0) return;
    Promise.all([
      fetch('/api/shops?limit=6&sort=newest').then(r => r.json()),
      fetch('/api/products?limit=8&sort=newest').then(r => r.json()),
    ])
      .then(([shops, products]) => {
        setFetchedShops(shops || []);
        setFetchedProducts(products || []);
      })
      .catch(() => { setFetchedShops([]); setFetchedProducts([]); });
  }, [serverShops]);

  const initialShops = fetchedShops || [];
  const featuredProducts = fetchedProducts || [];
  const selectedLocation = useLocationModal((s) => s.selectedLocation);

  // Dynamic items per page: 12 when sidebar collapsed, 10 when expanded
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 12 : 10;

  // Banner state
  const [activeBanner, setActiveBanner] = useState(0);

  // Pagination state
  const [shopsIndex, setShopsIndex] = useState(0);
  const [productsIndex, setProductsIndex] = useState(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [shopsVisible, setShopsVisible] = useState(true);
  const [productsVisible, setProductsVisible] = useState(true);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'shops' | 'products' | null>(null);

  // Seed for shuffling (stable during session, changes on page refresh)
  const [shuffleSeed] = useState(() => Date.now());

  // Get categories and search from URL params (support both legacy single and new multi-select)
  const currentCategories = params?.get('categories')?.split(',').filter(Boolean) ||
    (params?.get('category') ? [params.get('category')!] : []);
  const searchQuery = params?.get('q') || '';

  const headerSearchParams = {
    category: currentCategories[0] || undefined,
  };

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5';

  const shopGridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';

  // Reset pagination on sidebar change
  useEffect(() => {
    setShopsIndex(0);
    setProductsIndex(0);
  }, [isSidebarCollapsed]);


  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    const categoryIsActive = currentCategories.length > 0;
    const hasSearchFilter = !!searchQuery?.trim();
    const isFiltered = categoryIsActive || hasSearchFilter;

    let resultsHeaderText = '';
    if (categoryIsActive) {
      if (currentCategories.length === 1) {
        resultsHeaderText = `${currentCategories[0]} Results`;
      } else {
        resultsHeaderText = `${currentCategories.length} Categories`;
      }
    } else if (hasSearchFilter) {
      resultsHeaderText = 'Search Results';
    }

    return {
      isFiltered,
      categoryIsActive,
      resultsHeaderText,
      currentCategories
    };
  }, [currentCategories, searchQuery]);

  const q = searchQuery.trim().toLowerCase();

  const allShops = initialShops;
  const allProducts = featuredProducts;

  const filteredShops = useMemo(() => {
    let result = allShops;
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }
    if (currentCategories.length > 0) {
      result = result.filter((s) => currentCategories.includes(s.category ?? ''));
    }
    if (selectedLocation) {
      const [selCity, selState] = selectedLocation.toLowerCase().split(',').map(p => p.trim());
      result = result.filter((s) => {
        if (!s.location) return false;
        const [locCity, locState] = s.location.toLowerCase().split(',').map(p => p.trim());
        return locCity === selCity || (selState && locState === selState);
      });
    }
    return result;
  }, [allShops, q, currentCategories, selectedLocation]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    if (currentCategories.length > 0) {
      result = result.filter((p) => currentCategories.includes(p.category?.name ?? ''));
    }
    return result;
  }, [allProducts, q, currentCategories]);

  // Shuffled arrays for randomized display
  const shops = useMemo(() => {
    return shuffleArray(filteredShops, shuffleSeed);
  }, [filteredShops, shuffleSeed]);

  const products = useMemo(() => {
    return shuffleArray(filteredProducts, shuffleSeed + 1);
  }, [filteredProducts, shuffleSeed]);

  const hasShops = shops.length > 0;
  const hasProducts = products.length > 0;
  const hasContent = hasShops || hasProducts;

  // Animated transition helper (matching market pattern)
  const animateTransition = (
    setVisible: (visible: boolean) => void,
    setIndex: (index: number) => void,
    currentIndex: number,
    totalPages: number,
    direction: 'left' | 'right'
  ) => {
    if (totalPages <= 1 || isAnimating) return;

    setIsAnimating(true);
    setVisible(false);

    setTimeout(() => {
      const newIndex = direction === 'right'
        ? (currentIndex + 1) % totalPages
        : currentIndex === 0 ? totalPages - 1 : currentIndex - 1;

      setIndex(newIndex);
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(false);
      }, 50);
    }, FADE_OUT_DURATION);
  };

  // Paginated items
  const currentShops = useMemo(() => {
    if (shops.length <= ITEMS_PER_PAGE) return shops;
    const start = shopsIndex * ITEMS_PER_PAGE;
    return shops.slice(start, start + ITEMS_PER_PAGE);
  }, [shops, shopsIndex]);

  const currentProducts = useMemo(() => {
    if (products.length <= ITEMS_PER_PAGE) return products;
    const start = productsIndex * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, productsIndex]);

  // Total pages
  const totalShopsPages = Math.max(1, Math.ceil(shops.length / ITEMS_PER_PAGE));
  const totalProductsPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  // Scroll handlers
  const scrollShops = (dir: 'left' | 'right') =>
    animateTransition(setShopsVisible, setShopsIndex, shopsIndex, totalShopsPages, dir);

  const scrollProducts = (dir: 'left' | 'right') =>
    animateTransition(setProductsVisible, setProductsIndex, productsIndex, totalProductsPages, dir);

  // View all handlers
  const handleViewAllShops = () => {
    setViewAllMode('shops');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllProducts = () => {
    setViewAllMode('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setViewAllMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader currentUser={currentUser} />

      {/* Inline skeleton while fetching */}
      {isLoadingData && (
        <div>
          <div className="mt-8">
            <div className="rounded-2xl animate-pulse bg-stone-200/60 dark:bg-stone-800/60 w-full aspect-[4/1]" />
            <div className="flex gap-1.5 mt-3 justify-center">
              <div className="h-1.5 w-4 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
              <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
              <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
            </div>
          </div>
          <div className="mt-8 mb-5">
            <div className="h-7 w-52 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-5" />
            <div className="flex gap-6 overflow-x-hidden pb-2 pl-4 pr-4 -ml-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-[100px] h-[100px] rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-14 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="h-7 w-40 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="flex flex-row gap-3">
                    <div className="w-[120px] h-[120px] rounded-xl shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="h-4 w-36 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="h-3 w-24 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="h-3 w-16 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="w-9 h-9 rounded-xl shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pb-8">
            <div className="h-7 w-48 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-0.5 overflow-hidden rounded-xl">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="w-full aspect-[5/6] animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-16 mt-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-4 w-3/4 mt-1.5 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real content — hidden while loading */}
      {!isLoadingData && <>
      {/* Editorial Banner */}
      <div className="mt-8">
        <div
          className="relative group overflow-hidden rounded-2xl cursor-pointer"
          onClick={() => router.push(BANNERS[activeBanner].href)}
        >
          <div className="aspect-[4/1] bg-stone-900 relative">
            <Image
              key={activeBanner}
              src={BANNERS[activeBanner].src}
              alt={BANNERS[activeBanner].alt}
              fill
              className="object-contain group-hover:scale-[1.02] transition-all duration-700 ease-out"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            {/* Forme wordmark icon — top right */}
            <div className="absolute top-4 right-4 text-white/75">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" />
                <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" />
                <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-5">
              <p className="text-xs tracking-wide text-white/80 mb-0.5" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>{BANNERS[activeBanner].tag}</p>
              <h3 className="text-xl font-bold text-white leading-snug">{BANNERS[activeBanner].title}</h3>
              <p className="text-sm text-white/70 mt-0.5">{BANNERS[activeBanner].subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mt-3 justify-center items-center">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`rounded-full transition-all duration-300 ${
                activeBanner === i
                  ? 'w-4 h-1.5 bg-stone-900 dark:bg-white dark:bg-stone-900'
                  : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Shop By Category */}
      <div>
        <SectionHeader
          title="Shop By Category"
        />
        <div className="flex gap-6 overflow-x-auto pb-2 pl-4 pr-4 -ml-4 scrollbar-hide">
          {(() => {
            const imageMap: Record<string, string> = {
              Wellness: '/assets/people/wellness.png',
              Training: '/assets/people/fitness.png',
              Barber: '/assets/people/barber.png',
              Salon: '/assets/people/salon.png',
              Nails: '/assets/people/nails.png',
              Skincare: '/assets/people/skincare.png',
              Lashes: '/assets/people/lashes.png',
              Brows: '/assets/people/brows.png',
              Ink: '/assets/people/ink.png',
            };
            return categories.map((cat) => {
              const isSelected = currentCategories.includes(cat.label);
              const imageSrc = imageMap[cat.label];
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    const p = new URLSearchParams(params?.toString() || '');
                    if (isSelected) {
                      p.delete('category');
                    } else {
                      p.set('category', cat.label);
                    }
                    router.push(`/shops?${p.toString()}`);
                  }}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div
                    className={`w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-black transition-all duration-500 ease-out border-2 ${
                      isSelected
                        ? 'border-stone-900 dark:border-white scale-105 shadow-lg'
                        : 'border-stone-200  dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500 group-hover:scale-105 group-hover:shadow-md'
                    }`}
                  >
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={cat.label}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <span className={`text-sm transition-all duration-200 ${
                    isSelected
                      ? 'text-stone-900 dark:text-stone-100 dark:text-white font-medium'
                      : 'text-stone-500     group-hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 dark:group-hover:text-stone-300'
                  }`}>{cat.label}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-2">
        <div>
          {hasContent ? (
            <>
              {/* View All Shops Mode */}
              {viewAllMode === 'shops' && (
                <>
                  <SectionHeader
                    title="All Shops"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Shops"
                  />
                  <div className={`grid ${shopGridColsClass} gap-4 transition-all duration-300`}>
                    {shops.map((shop, idx) => (
                      <div
                        key={shop.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ShopCard data={shop} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* View All Products Mode */}
              {viewAllMode === 'products' && (
                <>
                  <SectionHeader
                    title="All Products"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Shops"
                  />
                  <div className={`grid ${gridColsClass} gap-0.5 overflow-hidden rounded-xl transition-all duration-300`}>
                    {products.map((product, idx) => (
                      <div
                        key={product.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ProductCard data={product} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Normal View - Show sections with pagination */}
              {!viewAllMode && (
                <>
                  {/* ===== Featured Shops Section ===== */}
                  {!filterInfo.isFiltered && hasShops && (
                    <>
                      <SectionHeader
                        title="Featured Shops"
                        onPrev={() => scrollShops('left')}
                        onNext={() => scrollShops('right')}
                        onViewAll={handleViewAllShops}
                      />
                      <div id="shops-rail">
                        <div className={`grid ${shopGridColsClass} gap-4 transition-all duration-300`}>
                          {currentShops.map((shop, idx) => (
                            <div
                              key={`${shop.id}-${shopsIndex}`}
                              style={{
                                opacity: shopsVisible ? 0 : 0,
                                animation: shopsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                animationDelay: shopsVisible ? `${140 + idx * 30}ms` : '0ms',
                                willChange: 'transform, opacity',
                                transition: !shopsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                              }}
                              className={!shopsVisible ? 'opacity-0' : ''}
                            >
                              <ShopCard data={shop} currentUser={currentUser} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Featured Products Section ===== */}
                  {!filterInfo.isFiltered && hasProducts && (
                    <>
                      <SectionHeader
                        title="Featured Products"
                        onPrev={() => scrollProducts('left')}
                        onNext={() => scrollProducts('right')}
                        onViewAll={handleViewAllProducts}
                      />
                      <div id="products-rail">
                        <div className={`grid ${gridColsClass} gap-0.5 overflow-hidden rounded-xl pb-8 transition-all duration-300`}>
                          {currentProducts.map((product, idx) => (
                            <div
                              key={`${product.id}-${productsIndex}`}
                              style={{
                                opacity: productsVisible ? 0 : 0,
                                animation: productsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                animationDelay: productsVisible ? `${160 + idx * 30}ms` : '0ms',
                                willChange: 'transform, opacity',
                                transition: !productsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                              }}
                              className={!productsVisible ? 'opacity-0' : ''}
                            >
                              <ProductCard data={product} currentUser={currentUser} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Results Section Header (when filtered) ===== */}
                  {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                    <SectionHeader
                      title={filterInfo.resultsHeaderText}
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Shops"
                    />
                  )}

                  {/* ===== Filtered Results - Shops Grid ===== */}
                  {filterInfo.isFiltered && hasShops && (
                    <div className={`grid ${shopGridColsClass} gap-4 mb-8 transition-all duration-300`}>
                      {shops.map((shop, idx) => (
                        <div
                          key={shop.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ShopCard data={shop} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ===== Filtered Results - Products Grid ===== */}
                  {filterInfo.isFiltered && hasProducts && (
                    <div className={`grid ${gridColsClass} gap-0.5 overflow-hidden rounded-xl transition-all duration-300`}>
                      {products.map((product, idx) => (
                        <div
                          key={product.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ProductCard data={product} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-stone-700 dark:text-stone-200 mb-1">
                {filterInfo.isFiltered ? 'No results found' : 'No shops yet'}
              </p>
              <p className="text-[13px] text-stone-400 dark:text-stone-500 max-w-xs">
                {filterInfo.isFiltered
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Shops and products will appear here as businesses join the platform.'}
              </p>
            </div>
          )}
        </div>
      </div>
      </>}
    </>
  );
};

export default ShopClient;

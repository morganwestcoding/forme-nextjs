'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import MarketSearch from '@/app/market/MarketSearch';
import CategoryNav from '@/app/market/CategoryNav';
import SectionHeader from '@/app/market/SectionHeader';

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const FADE_OUT_DURATION = 200;
const ITEMS_PER_PAGE = 8;

const ShopClient: React.FC<ShopClientProps> = ({
  initialShops = [],
  featuredProducts = [],
  currentUser,
}) => {
  const params = useSearchParams();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Pagination state
  const [shopsIndex, setShopsIndex] = useState(0);
  const [productsIndex, setProductsIndex] = useState(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [shopsVisible, setShopsVisible] = useState(true);
  const [productsVisible, setProductsVisible] = useState(true);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'shops' | 'products' | null>(null);

  // Get category and search from URL params
  const currentCategory = params?.get('category') || '';
  const searchQuery = params?.get('q') || '';

  const headerSearchParams = {
    category: currentCategory || undefined,
  };

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // Sidebar collapse detection
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    return () => window.removeEventListener('sidebarToggle', checkSidebarState);
  }, []);

  // Reset pagination on sidebar change
  useEffect(() => {
    setShopsIndex(0);
    setProductsIndex(0);
  }, [isSidebarCollapsed]);

  // Sticky nav border effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navWrapper = document.getElementById('shops-category-nav-wrapper');
      if (navWrapper) {
        if (window.scrollY > 100) {
          navWrapper.style.borderBottomColor = 'rgb(229 231 235 / 0.5)';
        } else {
          navWrapper.style.borderBottomColor = 'transparent';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'Featured' && currentCategory !== 'All';
    const hasSearchFilter = !!searchQuery?.trim();
    const isFiltered = categoryIsActive || hasSearchFilter;

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
      {/* Hero Section - Clean minimal design (matching Market) */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8 bg-white">

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Main Vendors Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Vendors
              </h1>
              <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">Discover unique shops and products from our vendors</p>
            </div>

            {/* Search and Controls */}
            <div className="mt-8 max-w-3xl mx-auto">
              <MarketSearch
                isHeroMode={false}
                basePath="/shops"
              />
            </div>

            {/* Category Navigation - Sticky */}
            <div className="mt-5 -mx-6 md:-mx-24">
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-transparent transition-all duration-300" id="shops-category-nav-wrapper">
                <div className="px-6 md:px-24">
                  <CategoryNav searchParams={headerSearchParams} basePath="/shops" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-[69px]">
        <div>
          {hasContent ? (
            <>
              {/* View All Shops Mode */}
              {viewAllMode === 'shops' && (
                <>
                  <SectionHeader
                    title="All Vendors"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Vendors"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {shops.map((shop, idx) => (
                      <div
                        key={shop.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
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
                    viewAllLabel="← Back to Vendors"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {products.map((product, idx) => (
                      <div
                        key={product.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
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
                        <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                          {currentShops.map((shop, idx) => (
                            <div
                              key={`${shop.id}-${shopsIndex}`}
                              style={{
                                opacity: shopsVisible ? 0 : 0,
                                animation: shopsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                        <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
                          {currentProducts.map((product, idx) => (
                            <div
                              key={`${product.id}-${productsIndex}`}
                              style={{
                                opacity: productsVisible ? 0 : 0,
                                animation: productsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                      viewAllLabel="← Back to Vendors"
                    />
                  )}

                  {/* ===== Filtered Results - Shops Grid ===== */}
                  {filterInfo.isFiltered && hasShops && (
                    <div className={`grid ${gridColsClass} gap-5 mb-8 transition-all duration-300`}>
                      {shops.map((shop, idx) => (
                        <div
                          key={shop.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
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
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                      {products.map((product, idx) => (
                        <div
                          key={product.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
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

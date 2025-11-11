'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import ListingCard from '@/components/listings/ListingCard';
import MarketSearch from './MarketSearch';
import CategoryNav from './CategoryNav';
import RentModal from '@/components/modals/ListingModal';
import WorkerCard from '@/components/listings/WorkerCard';
import SectionHeader from './SectionHeader';

interface MarketClientProps {
  searchParams: {
    userId?: string;
    locationValue?: string;
    category?: string;
    state?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    order?: 'asc' | 'desc';
    page?: string;
  };
  listings: SafeListing[];
  currentUser: SafeUser | null;

  /** Optional external feed; if omitted we derive from listings[].employees */
  trendingEmployees?: SafeEmployee[];
}


const MIN_LOADER_MS = 1200;
const FADE_OUT_DURATION = 200;
const FADE_IN_DELAY = 250;

const MarketClient: React.FC<MarketClientProps> = ({
  searchParams,
  listings,
  currentUser,
  trendingEmployees = [],
}) => {
  const router = useRouter();

  // 🆕 NEW: Track sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🆕 NEW: Dynamic items per page based on sidebar state
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 5 : 4;

  // Pagination state
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [trendingVisible, setTrendingVisible] = useState(true);
  
  // View all state
  const [viewAllMode, setViewAllMode] = useState<'storefronts' | 'professionals' | null>(null);

  // Loader (nice UX delay)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [listings]);

  // 🆕 NEW: Listen for sidebar state changes and reset pagination
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    
    return () => {
      window.removeEventListener('sidebarToggle', checkSidebarState);
    };
  }, []);

  // Reset pagination indices when sidebar state changes
  useEffect(() => {
    setFeaturedIndex(0);
    setTrendingIndex(0);
  }, [isSidebarCollapsed]);

  // 🆕 NEW: Dynamic grid columns based on sidebar state
  const gridColsClass = isSidebarCollapsed ? 'grid-cols-5' : 'grid-cols-4';

  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    // Get the current category from URL params (this is the source of truth)
    const currentCategory = searchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';

    // Check for price filters
    const hasPriceFilter =
      searchParams.minPrice !== undefined ||
      searchParams.maxPrice !== undefined;

    // Check for location filters
    const hasLocationFilter = !!(
      (searchParams.city as any)?.toString()?.trim() ||
      (searchParams.state as any)?.toString()?.trim()
    );

    const isFiltered = categoryIsActive || hasPriceFilter || hasLocationFilter;

    // Determine results header text
    let resultsHeaderText = '';
    if (categoryIsActive && currentCategory) {
      // Capitalize first letter of category
      const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      resultsHeaderText = `${categoryName} Listings`;
    } else if (hasPriceFilter || hasLocationFilter) {
      resultsHeaderText = 'Search Results';
    }

    return {
      isFiltered,
      categoryIsActive,
      resultsHeaderText,
      currentCategory
    };
  }, [searchParams]);

  const hasListings = useMemo(
    () => Array.isArray(listings) && listings.length > 0,
    [listings]
  );

  // Derive a "trending" pool if no external list is supplied.
  const derivedTrending = useMemo(() => {
    const pairs: { employee: SafeEmployee; listing: SafeListing }[] = [];

    listings.forEach((l) => {
      const anyListing = l as unknown as { employees?: SafeEmployee[]; galleryImages?: string[] };
      if (Array.isArray(anyListing.employees) && anyListing.employees.length) {
        anyListing.employees.forEach((emp) => {
          pairs.push({ employee: emp, listing: l });
        });
      }
    });

    pairs.sort((a, b) => {
      const ar = (a.employee as any).rating ?? 0;
      const br = (b.employee as any).rating ?? 0;
      if (br !== ar) return br - ar;
      const af = (a.employee as any).followerCount ?? 0;
      const bf = (b.employee as any).followerCount ?? 0;
      return bf - af;
    });

    return pairs.slice(0, 12); // keep a healthy pool
  }, [listings]);

  // If caller provides trendingEmployees (without listing context), pair them with a fallback listing.
  const finalTrending = useMemo(() => {
    if (trendingEmployees.length === 0) return derivedTrending;

    const fallbackListing = listings[0];
    return trendingEmployees.slice(0, 12).map((emp) => ({
      employee: emp,
      listing: (listings.find((l: any) => l.id === (emp as any).listingId) ||
        fallbackListing) as SafeListing,
    }));
  }, [trendingEmployees, derivedTrending, listings]);

  // Get current items for display
  const currentFeaturedListings = useMemo(() => {
    const itemsPerPage = ITEMS_PER_PAGE;
    if (listings.length <= itemsPerPage) {
      return listings;
    }
    const start = featuredIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return listings.slice(start, end);
  }, [listings, featuredIndex, ITEMS_PER_PAGE]);

  const currentTrendingItems = useMemo(() => {
    const itemsPerPage = ITEMS_PER_PAGE;
    if (finalTrending.length <= itemsPerPage) {
      return finalTrending;
    }
    const start = trendingIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return finalTrending.slice(start, end);
  }, [finalTrending, trendingIndex, ITEMS_PER_PAGE]);

  // Calculate total pages (minimum 1 page)
  const totalFeaturedPages = Math.max(1, Math.ceil(listings.length / ITEMS_PER_PAGE));
  const totalTrendingPages = Math.max(1, Math.ceil(finalTrending.length / ITEMS_PER_PAGE));

  // Animation helper function
  const animateTransition = (
    setVisible: (visible: boolean) => void,
    setIndex: (index: number) => void,
    currentIndex: number,
    totalPages: number,
    direction: 'left' | 'right'
  ) => {
    // Don't animate if we don't have multiple pages
    if (totalPages <= 1) {
      return;
    }
    
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Fade out current items
    setVisible(false);
    
    setTimeout(() => {
      // Calculate new index with looping
      let newIndex;
      if (direction === 'right') {
        newIndex = (currentIndex + 1) % totalPages;
      } else {
        newIndex = currentIndex === 0 ? totalPages - 1 : currentIndex - 1;
      }
      
      setIndex(newIndex);
      
      // Fade in new items after a brief delay
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(false);
      }, 50);
    }, FADE_OUT_DURATION);
  };

  // Scroll functions for section headers
  const scrollFeaturedRail = (dir: 'left' | 'right') => {
    animateTransition(
      setFeaturedVisible,
      setFeaturedIndex,
      featuredIndex,
      totalFeaturedPages,
      dir
    );
  };

  const scrollTrendingRail = (dir: 'left' | 'right') => {
    animateTransition(
      setTrendingVisible,
      setTrendingIndex,
      trendingIndex,
      totalTrendingPages,
      dir
    );
  };
  
  // Handle view all clicks
  const handleViewAllStorefronts = () => {
    setViewAllMode('storefronts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleViewAllWorkers = () => {
    setViewAllMode('professionals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBackToMain = () => {
    setViewAllMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Container>
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
            {/* Main Market Title */}
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Market
              </h1>
              <p className="text-gray-600 mt-3">Discover unique places from our vendors</p>
            </div>

            {/* Search and Controls */}
            <MarketSearch isHeroMode={false} />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <CategoryNav searchParams={searchParams} />

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
          {hasListings ? (
            <>
              {/* View All Storefronts Mode */}
                {viewAllMode === 'storefronts' && (
                  <>
                    <SectionHeader
                      title="All Storefronts"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Market"
                    />
                    
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                      {listings.map((listing, idx) => (
                        <div
                          key={listing.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ListingCard currentUser={currentUser} data={listing} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* View All Professionals Mode */}
                {viewAllMode === 'professionals' && (
                  <>
                    <SectionHeader
                      title="All Teammates"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Market"
                    />
                    
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                      {finalTrending.map(({ employee, listing }, idx) => {
                        const li: any = listing as any;
                        const imageSrc =
                          li?.imageSrc ||
                          (Array.isArray(li?.galleryImages) ? li.galleryImages[0] : undefined) ||
                          '/placeholder.jpg';

                        return (
                          <div
                            key={(employee as any).id ?? `${(employee as any).fullName}-${idx}`}
                            style={{
                              opacity: 0,
                              animation: `fadeInUp 520ms ease-out forwards`,
                              animationDelay: `${Math.min(idx * 30, 300)}ms`,
                              willChange: 'transform, opacity',
                            }}
                          >
                            <WorkerCard
                              employee={employee}
                              listingTitle={listing.title}
                              data={{
                                title: listing.title,
                                imageSrc,
                                category: (listing as any).category ?? 'General',
                              }}
                              listing={listing}
                              currentUser={currentUser ?? undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Normal View - Show sections with pagination */}
                {!viewAllMode && (
                  <>
                    {/* ===== Featured Storefronts Section ===== */}
                    {!filterInfo.isFiltered && (
                      <SectionHeader
                        title="Trending Storefronts"
                        onPrev={() => scrollFeaturedRail('left')}
                        onNext={() => scrollFeaturedRail('right')}
                        onViewAll={handleViewAllStorefronts}
                      />
                    )}

                    {/* ===== Results Section Header (when filtered) ===== */}
                    {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                      <SectionHeader
                        title={filterInfo.resultsHeaderText}
                      />
                    )}

                    {/* Listings Row - Dynamic columns based on sidebar */}
                    {!viewAllMode && (
                      <div id="featured-rail">
                        <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                          {currentFeaturedListings.map((listing, idx) => (
                            <div
                              key={`${listing.id}-${featuredIndex}`}
                              style={{
                                opacity: featuredVisible ? 0 : 0,
                                animation: featuredVisible 
                                  ? `fadeInUp 520ms ease-out forwards`
                                  : 'none',
                                animationDelay: featuredVisible 
                                  ? `${140 + idx * 30}ms`
                                  : '0ms',
                                willChange: 'transform, opacity',
                                transition: !featuredVisible 
                                  ? `opacity ${FADE_OUT_DURATION}ms ease-out`
                                  : 'none',
                              }}
                              className={!featuredVisible ? 'opacity-0' : ''}
                            >
                              <ListingCard currentUser={currentUser} data={listing} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

     
                    {finalTrending.length > 0 && !filterInfo.isFiltered && (
                      <>
                        <SectionHeader
                          title="Trending Professionals"
                          onPrev={() => scrollTrendingRail('left')}
                          onNext={() => scrollTrendingRail('right')}
                          onViewAll={handleViewAllWorkers}
                        />

                        <div id="trending-rail">
                          <div className={`grid ${gridColsClass} gap-4 transition-all pb-8 duration-300`}>
                            {currentTrendingItems.map(({ employee, listing }, idx) => {
                              const li: any = listing as any;
                              const imageSrc =
                                li?.imageSrc ||
                                (Array.isArray(li?.galleryImages) ? li.galleryImages[0] : undefined) ||
                                '/placeholder.jpg';

                              return (
                                <div
                                  key={`${(employee as any).id ?? `${(employee as any).fullName}-${idx}`}-${trendingIndex}`}
                                  style={{
                                    opacity: trendingVisible ? 0 : 0,
                                    animation: trendingVisible 
                                      ? `fadeInUp 520ms ease-out forwards`
                                      : 'none',
                                    animationDelay: trendingVisible 
                                      ? `${160 + idx * 30}ms`
                                      : '0ms',
                                    willChange: 'transform, opacity',
                                    transition: !trendingVisible 
                                      ? `opacity ${FADE_OUT_DURATION}ms ease-out`
                                      : 'none',
                                  }}
                                  className={!trendingVisible ? 'opacity-0' : ''}
                                >
                                  <WorkerCard
                                    employee={employee}
                                    listingTitle={listing.title}
                                    data={{
                                      title: listing.title,
                                      imageSrc,
                                      category: (listing as any).category ?? 'General',
                                    }}
                                    listing={listing}
                                    currentUser={currentUser ?? undefined}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="px-8 pt-32 text-center text-gray-500">
                No listings found. Try adjusting your filters.
              </div>
            )
          }
        </div>
      </div>
      </Container>
    </div>
  );
};

export default MarketClient;
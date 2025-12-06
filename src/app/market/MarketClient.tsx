'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Container from '@/components/Container';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import ListingCard from '@/components/listings/ListingCard';
import PageSearch from '@/components/search/PageSearch';
import CategoryNav from './CategoryNav';
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


const FADE_OUT_DURATION = 200;

const MarketClient: React.FC<MarketClientProps> = ({
  searchParams,
  listings,
  currentUser,
  trendingEmployees = [],
}) => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const ITEMS_PER_PAGE = 8;

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [trendingVisible, setTrendingVisible] = useState(true);
  const [viewAllMode, setViewAllMode] = useState<'storefronts' | 'professionals' | null>(null);

  // Sticky nav border effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navWrapper = document.getElementById('category-nav-wrapper');
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

  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    return () => window.removeEventListener('sidebarToggle', checkSidebarState);
  }, []);

  useEffect(() => {
    setFeaturedIndex(0);
    setTrendingIndex(0);
  }, [isSidebarCollapsed]);

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  const filterInfo = useMemo(() => {
    const currentCategory = searchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';
    const hasPriceFilter = searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined;
    const hasLocationFilter = !!(
      (searchParams.city as any)?.toString()?.trim() ||
      (searchParams.state as any)?.toString()?.trim()
    );

    const isFiltered = categoryIsActive || hasPriceFilter || hasLocationFilter;

    let resultsHeaderText = '';
    if (categoryIsActive && currentCategory) {
      const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      resultsHeaderText = `${categoryName} Listings`;
    } else if (hasPriceFilter || hasLocationFilter) {
      resultsHeaderText = 'Search Results';
    }

    return { isFiltered, categoryIsActive, resultsHeaderText, currentCategory };
  }, [searchParams]);

  const hasListings = useMemo(() => Array.isArray(listings) && listings.length > 0, [listings]);

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

    return pairs.slice(0, 12);
  }, [listings]);

  const finalTrending = useMemo(() => {
    if (trendingEmployees.length === 0) return derivedTrending;

    const fallbackListing = listings[0];
    return trendingEmployees.slice(0, 12).map((emp) => ({
      employee: emp,
      listing: (listings.find((l: any) => l.id === (emp as any).listingId) ||
        fallbackListing) as SafeListing,
    }));
  }, [trendingEmployees, derivedTrending, listings]);

  const currentFeaturedListings = useMemo(() => {
    const visibleListings = listings.filter(l => l.category !== 'Personal');
    if (visibleListings.length <= ITEMS_PER_PAGE) return visibleListings;
    const start = featuredIndex * ITEMS_PER_PAGE;
    return visibleListings.slice(start, start + ITEMS_PER_PAGE);
  }, [listings, featuredIndex, ITEMS_PER_PAGE]);

  const currentTrendingItems = useMemo(() => {
    if (finalTrending.length <= ITEMS_PER_PAGE) return finalTrending;
    const start = trendingIndex * ITEMS_PER_PAGE;
    return finalTrending.slice(start, start + ITEMS_PER_PAGE);
  }, [finalTrending, trendingIndex, ITEMS_PER_PAGE]);

  const visibleListingsCount = useMemo(
    () => listings.filter(l => l.category !== 'Personal').length,
    [listings]
  );
  const totalFeaturedPages = Math.max(1, Math.ceil(visibleListingsCount / ITEMS_PER_PAGE));
  const totalTrendingPages = Math.max(1, Math.ceil(finalTrending.length / ITEMS_PER_PAGE));

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

  const scrollFeaturedRail = (dir: 'left' | 'right') =>
    animateTransition(setFeaturedVisible, setFeaturedIndex, featuredIndex, totalFeaturedPages, dir);

  const scrollTrendingRail = (dir: 'left' | 'right') =>
    animateTransition(setTrendingVisible, setTrendingIndex, trendingIndex, totalTrendingPages, dir);

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
        {/* Hero Section - Clean minimal design */}
        <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8">

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Main Market Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Market
              </h1>
              <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">Discover unique places from our vendors</p>
            </div>

            {/* Search and Controls */}
            <div className="mt-8 max-w-3xl mx-auto">
              <PageSearch />
            </div>

            {/* Category Navigation - Sticky */}
            <div className="mt-5 -mx-6 md:-mx-24">
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-transparent transition-all duration-300" id="category-nav-wrapper">
                <div className="px-6 md:px-24">
                  <CategoryNav searchParams={searchParams} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-[69px]">
        <div>
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

                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                      {listings
                        .filter(l => l.category !== 'Personal')
                        .map((listing, idx) => (
                          <div
                            key={listing.id}
                            style={{
                              opacity: 0,
                              animation: `fadeInUp 520ms ease-out both`,
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
                    
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                              animation: `fadeInUp 520ms ease-out both`,
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
                        <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                          {currentFeaturedListings.map((listing, idx) => (
                            <div
                              key={`${listing.id}-${featuredIndex}`}
                              style={{
                                opacity: featuredVisible ? 0 : 0,
                                animation: featuredVisible 
                                  ? `fadeInUp 520ms ease-out both`
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
                          <div className={`grid ${gridColsClass} gap-5 transition-all pb-8 duration-300`}>
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
                                      ? `fadeInUp 520ms ease-out both`
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
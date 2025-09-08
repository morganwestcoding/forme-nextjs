'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import ListingCard from '@/components/listings/ListingCard';
import MarketExplorer from './MarketExplorer';
import RentModal from '@/components/modals/RentModal';
import WorkerCard from '@/components/listings/WorkerCard';
import SectionHeader from './SectionHeader';

interface MarketContentProps {
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

interface ViewState {
  mode: 'grid' | 'list';
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    state?: string;
  };
}

const MIN_LOADER_MS = 1200;

const MarketContent: React.FC<MarketContentProps> = ({
  searchParams,
  listings,
  currentUser,
  trendingEmployees = [],
}) => {
  const router = useRouter();

  // View state (for MarketExplorer controls)
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'grid',
    filters: {
      category: searchParams.category ?? 'featured',
    },
  });

  // Loader (nice UX delay)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [listings]);

  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    // Get the current category from URL params (this is the source of truth)
    const currentCategory = searchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';

    // Check for price filters
    const hasPriceFilter = 
      viewState?.filters?.minPrice !== undefined ||
      viewState?.filters?.maxPrice !== undefined ||
      searchParams.minPrice !== undefined ||
      searchParams.maxPrice !== undefined;

    // Check for location filters
    const hasLocationFilter = !!(
      viewState?.filters?.city?.trim() ||
      viewState?.filters?.state?.trim() ||
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
  }, [viewState, searchParams]);

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

  // Scroll functions for section headers (these will now just change which 4 items to show)
  const scrollFeaturedRail = (dir: 'left' | 'right') => {
    // This would need to be implemented to change which 4 listings are shown
    console.log('Scroll featured', dir);
  };

  const scrollTrendingRail = (dir: 'left' | 'right') => {
    // This would need to be implemented to change which 4 trending items are shown
    console.log('Scroll trending', dir);
  };

  const renderListView = () => (
    <div className="text-sm text-gray-500">List view goes here.</div>
  );

  return (
    <Container>

      {/* Main Market Title - Always Visible */}
      <div className="pt-2 mb-4">
        <div>
          <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">
            Market
          </h1>
          <p className="text-gray-600">Discover unique places from our vendors</p>
        </div>
      </div>

      {/* Search and Category Controls */}
      <MarketExplorer
        searchParams={searchParams}
        viewState={viewState}
        setViewState={setViewState}
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
          {viewState.mode === 'grid' ? (
            hasListings ? (
              <>
                {/* ===== Featured Storefronts Section ===== */}
                {!filterInfo.isFiltered && (
                  <SectionHeader
                    title="Featured Storefronts"
                    onPrev={() => scrollFeaturedRail('left')}
                    onNext={() => scrollFeaturedRail('right')}
                    onViewAll={() => router.push('/market?category=featured')}
                  />
                )}

                {/* ===== Results Section Header (when filtered) ===== */}
                {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                  <SectionHeader
                    title={filterInfo.resultsHeaderText}
                    // No navigation controls for results section
                  />
                )}

                {/* Listings Row (4 visible, no overflow scroll) */}
                <div id="featured-rail">
                  <div className="grid grid-cols-4 gap-4">
                    {listings.slice(0, 4).map((listing, idx) => (
                      <div
                        key={listing.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${140 + idx * 30}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ListingCard currentUser={currentUser} data={listing} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ===== Trending Teammates Section ===== */}
                {finalTrending.length > 0 && !filterInfo.isFiltered && (
                  <>
                    <SectionHeader
                      title="Trending Teammates"
                      onPrev={() => scrollTrendingRail('left')}
                      onNext={() => scrollTrendingRail('right')}
                      onViewAll={() => router.push('/market?category=trending-teammates')}
                    />

                    <div id="trending-rail">
                      <div className="grid grid-cols-4 gap-4">
                        {finalTrending.slice(0, 4).map(({ employee, listing }, idx) => {
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
                                animationDelay: `${160 + idx * 30}ms`,
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
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                No listings found. Try adjusting your filters.
              </div>
            )
          ) : (
            renderListView()
          )}
        </div>
      </div>
    </Container>
  );
};

export default MarketContent;
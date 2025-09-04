// components/market/MarketContent.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Container from '@/components/Container';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import ListingCard from '@/components/listings/ListingCard';
import MarketExplorer from './MarketExplorer';
import RentModal from '@/components/modals/RentModal';
import WorkerCard from '@/components/listings/WorkerCard';

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

  const hasListings = useMemo(
    () => Array.isArray(listings) && listings.length > 0,
    [listings]
  );

  // Derive a “trending” pool if no external list is supplied.
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

  const renderListView = () => (
    <div className="text-sm text-gray-500">List view goes here.</div>
  );

  return (
    <Container>
      {/* Mount edit modal so updates from here trigger router.refresh in the modal */}
      <RentModal />

      <div className="">
        <div className="pt-2 mb-4">
          <div>
            <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">
              Market
            </h1>
            <p className="text-gray-600">Discover unique places from our vendors</p>
          </div>
        </div>

        <MarketExplorer
          searchParams={searchParams}
          viewState={viewState}
          setViewState={setViewState}
        />
      </div>

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
                {/* ===== Listings Row (4 visible, horizontal scroll for more) ===== */}
                <div className="overflow-x-auto overflow-y-hidden">
                  <div
                    className="
                      grid grid-flow-col auto-cols-[calc((100%-48px)/4)]
                      gap-4 pr-4
                      snap-x snap-mandatory
                    "
                    // 48px = 3 gaps * 16px (gap-4) between 4 visible cols
                  >
                    {listings.map((listing, idx) => (
                      <div
                        key={listing.id}
                        className="snap-start"
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${140 + (idx % 12) * 30}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ListingCard currentUser={currentUser} data={listing} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ===== Trending Teammates (3 visible, horizontal scroll for more) ===== */}
                {finalTrending.length > 0 && (
                  <>
                    <h2 className="text-lg md:text-lg text-black font-semibold leading-tight tracking-wide py-4 mt-4">
                      Trending Teammates
                    </h2>

                    <div className="overflow-x-auto overflow-y-hidden">
                      <div
                        className="
                          grid grid-flow-col auto-cols-[calc((100%-32px)/3)]
                          gap-4 pr-4
                          snap-x snap-mandatory
                        "
                        // 32px = 2 gaps * 16px between 3 visible cols
                      >
                        {finalTrending.map(({ employee, listing }, idx) => {
                          const li: any = listing as any;
                          const imageSrc =
                            li?.imageSrc ||
                            (Array.isArray(li?.galleryImages) ? li.galleryImages[0] : undefined) ||
                            '/placeholder.jpg';

                          return (
                            <div
                              key={(employee as any).id ?? `${(employee as any).fullName}-${idx}`}
                              className="snap-start"
                              style={{
                                opacity: 0,
                                animation: `fadeInUp 520ms ease-out forwards`,
                                animationDelay: `${160 + (idx % 12) * 30}ms`,
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

/* If you don't already have it in globals.css:
@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
*/

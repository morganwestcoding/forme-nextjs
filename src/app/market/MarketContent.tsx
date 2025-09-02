// components/MarketContent.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Container from '@/components/Container';
import { SafeListing, SafeUser } from '@/app/types';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import ListingCard from '@/components/listings/ListingCard';
import MarketExplorer from './MarketExplorer';
import RentModal from '@/components/modals/RentModal';

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
  currentUser
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

  // Optional: memoize an empty-state check
  const hasListings = useMemo(() => Array.isArray(listings) && listings.length > 0, [listings]);

  const renderListView = () => (
    <div className="text-sm text-gray-500">List view goes here.</div>
  );

  return (
    <Container>
      {/* Mount edit modal so updates from here trigger router.refresh in the modal */}
      <RentModal />

      <div className="pb-6">
        <div className="pt-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market</h1>
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

        <div className={`transition-opacity duration-700 ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {viewState.mode === 'grid' ? (
            hasListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {listings.map((listing, idx) => (
                  <div
                    key={listing.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 520ms ease-out forwards`,
                      animationDelay: `${140 + (idx % 12) * 30}ms`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <ListingCard
                      currentUser={currentUser}
                      data={listing}
                    />
                  </div>
                ))}
              </div>
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

/* ----- Add these keyframes to your globals.css if you don't have them already -----
@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
------------------------------------------------------------------------------------- */

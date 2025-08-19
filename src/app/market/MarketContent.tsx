'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Masonry from 'react-masonry-css';

import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from '@/components/listings/WorkerCard';
import { categories } from '@/components/Categories';
import Container from '@/components/Container';
import MarketExplorer from './MarketExplorer';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import { SafeListing, SafeUser } from '@/app/types';

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

type CardType = 'listing' | 'service' | 'worker';

const MIN_LOADER_MS = 1800; // keep loader visible a bit longer

const MarketContent = ({
  searchParams,
  listings,
  currentUser
}: MarketContentProps) => {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>({
    mode: 'grid',
    filters: {
      category: searchParams.category ?? 'featured',
    }
  });

  const [shuffledCards, setShuffledCards] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const renderListView = () => (
    <div className="text-sm text-gray-500">List view goes here.</div>
  );

  const generateShuffledCards = () => {
    const rawCards: { type: CardType; element: JSX.Element }[] = [];

    listings.forEach((listing) => {
      rawCards.push({
        type: 'listing',
        element: (
          <ListingCard
            key={`listing-${listing.id}`}
            currentUser={currentUser}
            data={listing}
            categories={categories}
          />
        )
      });

      listing.services.forEach((service) => {
        rawCards.push({
          type: 'service',
          element: (
            <ServiceCard
              key={`service-${service.id}`}
              service={service}
              listingLocation={listing.location ?? ''}
              listingTitle={listing.title}
              listingImage={listing.galleryImages?.[0] || listing.imageSrc}
              listing={listing}
              currentUser={currentUser}
              storeHours={listing.storeHours}
            />
          )
        });
      });

      listing.employees?.forEach((employee) => {
        rawCards.push({
          type: 'worker',
          element: (
            <WorkerCard 
              key={`worker-${employee.id}`}
              employee={employee}
              listingTitle={listing.title}
              data={{
                title: listing.title,
                imageSrc: listing.imageSrc,
                category: listing.category
              }}
              listing={listing}
              currentUser={currentUser}
              onFollow={() => console.log('Follow')}
              onBook={() => console.log('Book')}
            />
          )
        });
      });
    });

    // Shuffle, then place to avoid same-type stacking
    const shuffled = [...rawCards].sort(() => 0.5 - Math.random());
    const columns = 3;
    const layout: (typeof rawCards[0] | null)[] = Array(shuffled.length).fill(null);
    let i = 0;

    for (const card of shuffled) {
      while (i < layout.length) {
        const aboveIndex = i - columns;
        const above = layout[aboveIndex]?.type;
        if (above !== card.type) {
          layout[i] = card;
          i++;
          break;
        }
        i++;
      }
    }

    // Staggered fade-in styles per card
    return layout.reduce<JSX.Element[]>((acc, card, idx) => {
      if (!card) return acc;
      acc.push(
        <div
          key={`card-${idx}`}
          style={{
            opacity: 0,
            animation: `fadeInUp 520ms ease-out forwards`,
            // small random variance to feel organic
            animationDelay: `${140 + (idx % 12) * 30}ms`,
            willChange: 'transform, opacity',
          }}
        >
          {card.element}
        </div>
      );
      return acc;
    }, []);
  };

  useEffect(() => {
    const cards = generateShuffledCards();
    const t = setTimeout(() => {
      setShuffledCards(cards);
      setIsLoading(false);
    }, MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, [listings]);

  const masonryBreakpoints = useMemo(
    () => ({
      default: 3,
      1024: 3,
      768: 2,
      0: 1
    }),
    []
  );

  return (
    <Container>
      <div className="pb-6">
        <div className="pt-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market</h1>
            <p className="text-gray-600">Discover unique services from our vendors</p>
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
        {/* Overlay loader on top */}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
            <div className="mt-40 md:mt-40">
              <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
            </div>
          </div>
        )}

        {/* Cards container fades in under the loader */}
        <div
          className={`transition-opacity duration-700 ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        >
          {viewState.mode === 'grid' ? (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex gap-4"
              columnClassName="space-y-4"
            >
              {shuffledCards}
            </Masonry>
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

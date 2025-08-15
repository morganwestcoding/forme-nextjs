'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Masonry from 'react-masonry-css';

import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from '@/components/listings/WorkerCard';
import { categories } from '@/components/Categories';
import Container from '@/components/Container';
import MarketExplorer from './MarketExplorer';
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

const MarketContent = ({
  searchParams,
  listings,
  currentUser
}: MarketContentProps) => {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>({
    mode: 'grid',
    filters: {
    category: searchParams.category ?? 'featured', // ✅ default Featured
    }
  });

  const [shuffledCards, setShuffledCards] = useState<JSX.Element[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

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
              listing={listing} // Add the full listing object
              currentUser={currentUser} // Add the current user
              storeHours={listing.storeHours} // Add store hours
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
              listing={listing} // Add the full listing object
              currentUser={currentUser} // Add the current user
              onFollow={() => console.log('Follow')}
              onBook={() => console.log('Book')}
            />
          )
        });
      });
    });

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

    // FIX: use reduce to avoid TS null warning
    return layout.reduce<JSX.Element[]>((acc, card, i) => {
      if (!card) return acc;
      acc.push(
        <div key={`card-${i}`} className="animate-fade-in">
          {card.element}
        </div>
      );
      return acc;
    }, []);
  };

  useEffect(() => {
    setShuffledCards(generateShuffledCards());
    setHasMounted(true);
  }, [listings]);

  const masonryBreakpoints = {
    default: 3,
    1024: 3,
    768: 2,
    0: 1
  };

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

      <div className="flex flex-col">
        {viewState.mode === 'grid' ? (
          hasMounted && (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex gap-4"
              columnClassName="space-y-4"
            >
              {shuffledCards}
            </Masonry>
          )
        ) : (
          renderListView()
        )}
      </div>
    </Container>
  );
};

export default MarketContent;
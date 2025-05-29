'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
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

const MarketContent = ({
  searchParams,
  listings,
  currentUser
}: MarketContentProps) => {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>({
    mode: 'grid',
    filters: {
      category: 'all',
    }
  });

  const renderListView = () => {
    return <div className="text-sm text-gray-500">List view goes here.</div>;
  };

  return (
    <Container>
      <div className="pb-6">
        <div className="mb-6 flex items-center gap-4">
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
          <div className="
            grid 
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4
          ">
            {Array.from({ length: Math.ceil(listings.length / 2) }).map((_, index) => {
              const firstListing = listings[index * 2];
              const secondListing = listings[index * 2 + 1];

              const servicePair = [
                ...(firstListing?.services.slice(0, 1) || []),
                ...(secondListing?.services.slice(0, 1) || [])
              ];

              const insertIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
              const rowComponents = [];

              if (insertIndex === 0) {
                rowComponents.push(
                  <div key={`service-${index}`} className="flex flex-col gap-4">
                    {servicePair.map((service, i) => {
                      const listing = i === 0 ? firstListing : secondListing;
                      return listing ? (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          listingLocation={listing.location ?? ''}
                          listingTitle={listing.title ?? ''}
                          listingImage={listing.galleryImages?.[0] || listing.imageSrc}
                        />
                      ) : null;
                    })}
                  </div>
                );
              }

              if (firstListing) {
                rowComponents.push(
                  <ListingCard
                    key={firstListing.id}
                    currentUser={currentUser}
                    data={firstListing}
                    categories={categories}
                  />
                );
              }

              if (insertIndex === 1) {
                rowComponents.push(
                  <div key={`service-${index}`} className="flex flex-col gap-4">
                    {servicePair.map((service, i) => {
                      const listing = i === 0 ? firstListing : secondListing;
                      return listing ? (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          listingLocation={listing.location ?? ''}
                          listingTitle={listing.title ?? ''}
                          listingImage={listing.galleryImages?.[0] || listing.imageSrc}
                        />
                      ) : null;
                    })}
                  </div>
                );
              }

              if (secondListing) {
                rowComponents.push(
                  <ListingCard
                    key={secondListing.id}
                    currentUser={currentUser}
                    data={secondListing}
                    categories={categories}
                  />
                );
              }

              if (insertIndex === 2) {
                rowComponents.push(
                  <div key={`service-${index}`} className="flex flex-col gap-4">
                    {servicePair.map((service, i) => {
                      const listing = i === 0 ? firstListing : secondListing;
                      return listing ? (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          listingLocation={listing.location ?? ''}
                          listingTitle={listing.title ?? ''}
                          listingImage={listing.galleryImages?.[0] || listing.imageSrc}
                        />
                      ) : null;
                    })}
                  </div>
                );
              }

              return <React.Fragment key={index}>{rowComponents}</React.Fragment>;
            })}
          </div>
        ) : (
          renderListView()
        )}
      </div>
    </Container>
  );
};

export default MarketContent;

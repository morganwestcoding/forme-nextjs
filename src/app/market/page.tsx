'use client';
import React, { useEffect, useState } from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import getListings, { IListingsParams } from '@/app/actions/getListings';
import ClientOnly from '@/components/ClientOnly';
import { SafeUser, SafeListing } from '../types';
interface MarketProps {
  searchParams: IListingsParams;
}

const Market = ({ searchParams }: MarketProps) => {
  const [listings, setListings] = useState<SafeListing[]>([]);
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = await getListings(searchParams);
        setListings(listings);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
      setLoading(false);
    };

    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchListings();
    fetchCurrentUser();
  }, [searchParams]);

  if (loading) {
    return (
      <ClientOnly>
        <div>Loading...</div>
      </ClientOnly>
    );
  }

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }



  return (
    <ClientOnly>
      <div className="pt-2 pl-4 mx-24 flex-1">
        <div
          className="
            pt-6
            grid
            grid-cols-4
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-6
          "
        >
          {listings.map((listing: any) => (
            <ListingCard
              currentUser={currentUser}
              key={listing.id}
              data={listing}
              categories={categories}
            />
          ))}
        </div>
      </div>
    </ClientOnly>
  );
};

export default Market;
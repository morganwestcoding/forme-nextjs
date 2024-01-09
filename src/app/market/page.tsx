import React from 'react'
import ClientProviders from '@/components/ClientProviders'
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard'


import getListings, { 
  IListingsParams
} from "@/app/actions/getListings";

interface MarketProps {
  searchParams: IListingsParams
};

const Market = async ({ searchParams }: MarketProps) => {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientProviders>
        <EmptyState showReset />
      </ClientProviders>
    );
  }

  return (
  <ClientProviders>
    <div className="pt-10 pl-16 pr-16 flex-1">
    <div 
    className="
      pt-10
      grid 
      grid-cols-4 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6
      gap-8
    "
  >
    {listings.map((listing: any) => (
      <ListingCard
        currentUser={currentUser}
        key={listing.id}
        data={listing}
      />
    ))}
  </div>
  </div>
  </ClientProviders>
  )
}

export default Market;
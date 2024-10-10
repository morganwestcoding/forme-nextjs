import React from 'react'
import ClientProviders from '@/components/ClientProviders'
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard'
import { categories } from '@/components/Categories';
import { useCategoryStore } from '@/app/hooks/useCategoryStore';

import getListings, { 
  IListingsParams
} from "@/app/actions/getListings";

interface MarketProps {
  searchParams: IListingsParams
};

export const dynamic = 'force-dynamic';

const Market = async ({ searchParams }: MarketProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;

  console.log('Category to use in Market:', categoryToUse);

  const listings = await getListings({ ...searchParams, category: categoryToUse });
  const currentUser = await getCurrentUser();

  console.log('Listings fetched:', listings.length);

  if (listings.length === 0) {
    return (
      <ClientProviders>
        <EmptyState showReset />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <div className="pt-2 pl-4 mx-24 flex-1">
        <div className="
          pt-6
          grid 
          grid-cols-4 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-6
        ">
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
    </ClientProviders>
  )
}

export default Market;
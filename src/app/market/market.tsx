// Market.tsx
import React from 'react';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import getListings, { IListingsParams } from "@/app/actions/getListings";
import Pagination from '@/components/pagination/Pagination';

interface MarketProps {
  searchParams: IListingsParams & {
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

// Make this a Server Component
const Market = async ({ searchParams }: MarketProps) => {
  const currentPage = Number(searchParams.page) || 1;
  const categoryFromParams = searchParams.category;

  // Fetch data using the category from URL params
  const listings = await getListings({ 
    ...searchParams, 
    category: categoryFromParams 
  });
  
  const currentUser = await getCurrentUser();

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginatedListings = listings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (listings.length === 0) {
    return (
      <ClientProviders>
        <EmptyState showReset />
      </ClientProviders>
    );
  }

  return (
    <div className="pt-2 pl-4 mx-24 h-[calc(100vh-80px)] flex flex-col">
      <div className="
        pt-6
        flex-1
        grid 
        grid-cols-4 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
        gap-6
      ">
        {paginatedListings.map((listing: any) => (
          <ListingCard
            currentUser={currentUser}
            key={listing.id}
            data={listing}
            categories={categories}
          />
        ))}
      </div>
      <div className="flex justify-center w-full pt-4 translate-x-10">
        <div className="w-[500px]">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={listings.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Market;
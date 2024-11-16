import React from 'react';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import { useCategoryStore } from '@/app/hooks/useCategoryStore';
import getListings, { IListingsParams } from "@/app/actions/getListings";
import Pagination from '@/components/pagination/Pagination';

interface MarketProps {
  searchParams: IListingsParams & {
    page?: string;
  };
}

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

const Market = async ({ searchParams }: MarketProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  const currentPage = Number(searchParams.page) || 1;

  const listings = await getListings({ ...searchParams, category: categoryToUse });
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
  <ClientProviders>
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
        overflow-y-auto
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
      <div className="flex  justify-center w-full pt-4  translate-x-10"> {/* Modified this line */}
        <div className="w-[500px]"> {/* Added container with fixed width */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={listings.length}
          />
        </div>
      </div>
    </div>
  </ClientProviders>
);
};

export default Market;
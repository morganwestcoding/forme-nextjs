import React from 'react';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import getListings, { IListingsParams } from "@/app/actions/getListings";
import Pagination from '@/components/pagination/Pagination';
import { useFilter } from '@/FilterContext';

interface MarketProps {
  searchParams: IListingsParams & {
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

const Market = async ({ searchParams }: MarketProps) => {
  const currentPage = Number(searchParams.page) || 1;
  
  // Fetch all listings first
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

  // Apply filters
  let filteredListings = [...listings];

  // Apply location filters from searchParams
  if (searchParams.state || searchParams.city) {
    filteredListings = filteredListings.filter(listing => {
      if (!listing.location) return false;
      
      const listingLocation = listing.location.toLowerCase();
      const stateMatches = !searchParams.state || 
        listingLocation.includes(searchParams.state.toLowerCase());
      const cityMatches = !searchParams.city || 
        listingLocation.includes(searchParams.city.toLowerCase());
      
      return stateMatches && cityMatches;
    });
  }

  // Apply price filters
  if (searchParams.minPrice || searchParams.maxPrice) {
    filteredListings = filteredListings.filter(listing => {
      // Get the minimum service price for the listing
      const minServicePrice = Math.min(...listing.services.map(service => service.price));
      
      // Check if price is within range
      const aboveMin = !searchParams.minPrice || minServicePrice >= Number(searchParams.minPrice);
      const belowMax = !searchParams.maxPrice || minServicePrice <= Number(searchParams.maxPrice);
      
      return aboveMin && belowMax;
    });
  }

  // Apply sort
  if (searchParams.order) {
    filteredListings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return searchParams.order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (filteredListings.length === 0) {
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
            totalResults={filteredListings.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Market;
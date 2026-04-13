import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings from './actions/getListings';
import getShops, { IShopsParams } from './actions/getShops';
import { useCategoryStore } from './hooks/useCategoryStore';
import DiscoverClient from '@/components/DiscoverClient';
import { SafeListing } from '@/app/types';

interface PostProps {
  searchParams: IPostsParams & {
    filter?: 'following' | 'for-you' | 'likes' | 'bookmarks';
  }
}

export const dynamic = 'force-dynamic';

const Discover = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  
  // Get filter from searchParams or default to 'for-you'
  const filter = searchParams.filter || 'for-you';
  
  // Create params objects with proper typing.
  // We pull academy-owned listings here too so their student Employees show
  // up in the worker rail. We'll strip the academy listings out of the
  // bookable-listings prop below so they don't appear as bookable salons.
  const listingParams = {
    category: categoryToUse,
    order: 'desc' as const,
    includeAcademy: true,
  };

  const shopsParams: IShopsParams = {
    category: categoryToUse,
    order: 'desc',
    isVerified: undefined, // Get all shops
    limit: 20 // Limit for performance
  };

  // Fetch all data in parallel — catch individually so one failure doesn't crash the page
  const [posts, currentUser, listings, shops] = await Promise.all([
    getPosts({
      ...searchParams,
      category: categoryToUse,
      filter: filter as 'following' | 'for-you' | 'likes' | 'bookmarks'
    }),
    getCurrentUser(),
    getListings(listingParams),
    getShops(shopsParams)
  ]);

  // Ensure listings is an array and extract employees safely.
  // Workers (including students) come from ALL listings — students live as
  // Employees of an academy-owned listing. Bookable listings exclude academy
  // listings so they don't appear as salons in discovery.
  const safeListings: SafeListing[] = Array.isArray(listings) ? listings : [];
  const employees = safeListings.flatMap((listing: SafeListing) => listing.employees);
  const bookableListings = safeListings.filter((l) => !l.academyId);


  return (
    <DiscoverClient
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
      listings={bookableListings}
      // Worker rails need the full listing set (including academy listings)
      // so student WorkerCards can resolve their true listing for routing.
      allListingsForLookup={safeListings}
      employees={employees}
      shops={shops}
    />
  );
};

export default Discover;
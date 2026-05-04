import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings from './actions/getListings';
import getIndependentWorkers from './actions/getIndependentWorkers';
import getShops, { IShopsParams } from './actions/getShops';
import { useCategoryStore } from './hooks/useCategoryStore';
import DiscoverClient from '@/components/DiscoverClient';
import { SafeListing } from '@/app/types';

interface PostProps {
  searchParams: IPostsParams & {
    filter?: 'following' | 'for-you' | 'likes' | 'bookmarks';
  };
}

export const dynamic = 'force-dynamic';

const Discover = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  const filter = searchParams.filter || 'for-you';

  const listingParams = {
    category: categoryToUse,
    order: 'desc' as const,
    includeAcademy: true,
  };

  const shopsParams: IShopsParams = {
    category: categoryToUse,
    order: 'desc',
    isVerified: undefined,
    limit: 20,
  };

  const [posts, currentUser, listings, shops, independents] = await Promise.all([
    getPosts({
      ...searchParams,
      category: categoryToUse,
      filter: filter as 'following' | 'for-you' | 'likes' | 'bookmarks',
    }).catch(() => []),
    getCurrentUser().catch(() => null),
    getListings(listingParams).catch(() => []),
    getShops(shopsParams).catch(() => []),
    getIndependentWorkers().catch(() => []),
  ]);

  const safeListings: SafeListing[] = Array.isArray(listings) ? listings : [];
  // Merge employees from real listings with independents (whose shell listings
  // are filtered out of safeListings — see getListings.ts). Without this merge
  // independents would never appear on Discover.
  const employees = [
    ...safeListings.flatMap((listing: SafeListing) => listing.employees || []),
    ...independents,
  ];
  const bookableListings = safeListings.filter((l) => !l.academyId);

  return (
    <DiscoverClient
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
      listings={bookableListings}
      allListingsForLookup={safeListings}
      employees={employees}
      shops={shops}
    />
  );
};

export default Discover;

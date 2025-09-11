import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings from './actions/getListings';
import getShops, { IShopsParams } from './actions/getShops';
import { useCategoryStore } from './hooks/useCategoryStore';
import NewsfeedClient from '@/components/NewsfeedClient';
import { SafeListing } from '@/app/types';

interface PostProps {
  searchParams: IPostsParams & {
    filter?: 'following' | 'for-you' | 'likes' | 'bookmarks';
  }
}

export const dynamic = 'force-dynamic';

const Newsfeed = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  
  // Get filter from searchParams or default to 'for-you'
  const filter = searchParams.filter || 'for-you';
  
  // Create params objects with proper typing
  const listingParams = {
    order: 'desc' as const // Default to newest listings
  };

  const shopsParams: IShopsParams = {
    order: 'desc',
    isVerified: undefined, // Get all shops
    limit: 20 // Limit for performance
  };

  // Fetch all data in parallel
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

  // Ensure listings is an array and extract employees safely
  const safeListings: SafeListing[] = Array.isArray(listings) ? listings : [];
  const employees = safeListings.flatMap((listing: SafeListing) => listing.employees);

  return (
    <NewsfeedClient 
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
      listings={safeListings}
      employees={employees}
      shops={shops}
    />
  );
};

export default Newsfeed;